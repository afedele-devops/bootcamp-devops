const form = document.getElementById("searchForm");
const input = document.getElementById("pokemonInput");
const card = document.getElementById("pokemonCard");
const sourceBadge = document.getElementById("sourceBadge");
const message = document.getElementById("message");
const favoritesList = document.getElementById("favoritesList");
const refreshFavoritesBtn = document.getElementById("refreshFavorites");

let currentPokemonName = null;

function cap(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function showMessage(text) {
  message.textContent = text;
}

function renderPokemon(payload) {
  const { name, image, types, stats } = payload;
  currentPokemonName = name;

  const typePills = types.map((type) => `<span class="type-pill">${cap(type)}</span>`).join("");

  card.innerHTML = `
    <img src="${image || ""}" alt="${name}" />
    <div>
      <h3>${cap(name)}</h3>
      <div class="types">${typePills}</div>
      <div class="stats">
        <span>HP: ${stats.hp ?? "-"}</span>
        <span>Attack: ${stats.attack ?? "-"}</span>
        <span>Defense: ${stats.defense ?? "-"}</span>
        <span>Speed: ${stats.speed ?? "-"}</span>
      </div>
      <div style="margin-top:12px;">
        <button id="favoriteBtn" type="button">Add to favorites</button>
      </div>
    </div>
  `;

  card.classList.remove("hidden");

  const favoriteBtn = document.getElementById("favoriteBtn");
  favoriteBtn.addEventListener("click", async () => {
    if (!currentPokemonName) return;

    try {
      const response = await fetch("/api/session/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: currentPokemonName })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Could not add favorite");
      }

      showMessage(`${cap(currentPokemonName)} added to session favorites.`);
      await loadFavorites();
    } catch (error) {
      showMessage(error.message);
    }
  });
}

function renderSource(source) {
  sourceBadge.className = `badge ${source}`;
  sourceBadge.textContent = source === "cache" ? "Source: Redis cache" : "Source: PokeAPI";
  sourceBadge.classList.remove("hidden");
}

async function searchPokemon(event) {
  event.preventDefault();
  const value = input.value.trim().toLowerCase();
  if (!value) return;

  showMessage("Searching...");

  try {
    const response = await fetch(`/api/pokemon/${encodeURIComponent(value)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Pokemon not found");
    }

    renderSource(data.source);
    renderPokemon(data.data);
    showMessage("Pokemon loaded successfully.");
  } catch (error) {
    card.classList.add("hidden");
    sourceBadge.classList.add("hidden");
    showMessage(error.message);
  }
}

async function removeFavorite(name) {
  try {
    const response = await fetch(`/api/session/favorites/${encodeURIComponent(name)}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Could not remove favorite");
    }

    showMessage(`${cap(name)} removed from favorites.`);
    await loadFavorites();
  } catch (error) {
    showMessage(error.message);
  }
}

function renderFavorites(favorites) {
  if (!favorites.length) {
    favoritesList.innerHTML = "<li class='muted'>No favorites in this session yet.</li>";
    return;
  }

  favoritesList.innerHTML = favorites
    .map(
      (name) => `
        <li class="favorite-item">
          <span>${cap(name)}</span>
          <button type="button" data-name="${name}">Delete</button>
        </li>
      `
    )
    .join("");

  favoritesList.querySelectorAll("button[data-name]").forEach((btn) => {
    btn.addEventListener("click", () => removeFavorite(btn.dataset.name));
  });
}

async function loadFavorites() {
  try {
    const response = await fetch("/api/session/favorites");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not load favorites");
    }

    renderFavorites(data.favorites || []);
  } catch (error) {
    showMessage(error.message);
  }
}

form.addEventListener("submit", searchPokemon);
refreshFavoritesBtn.addEventListener("click", loadFavorites);

loadFavorites();
