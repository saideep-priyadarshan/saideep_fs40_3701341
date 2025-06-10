import API_KEY from "./apikey.js";

document.addEventListener("DOMContentLoaded", () => {
  const apiKey = API_KEY;
  const videoGrid = document.getElementById("video-grid");
  const searchBar = document.getElementById("search-bar");
  const searchButton = document.getElementById("search-button");
  const searchSuggestionsContainer =
    document.getElementById("search-suggestions");
  const homeLink = document.getElementById("home-link");
  const videoPlayerContainer = document.getElementById(
    "video-player-container"
  );
  const iframePlayer = document.getElementById("youtube-iframe-player");

  let debounceTimer;
  const DEBOUNCE_DELAY = 300;
  const THROTTLE_DELAY = 250;
  let lastScrollTime = 0;
  let lastResizeTime = 0;

  async function fetchYouTubeAPI(endpoint, params) {
    const urlParams = new URLSearchParams(params);
    const url = `https://www.googleapis.com/youtube/v3/${endpoint}?key=${apiKey}&${urlParams.toString()}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("YouTube API Error:", errorData);
        alert(`Error fetching data from YouTube: ${errorData.error.message}`);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error("Network or other error:", error);
      alert("Could not connect to YouTube API. Check your network or API key.");
      return null;
    }
  }

  async function fetchPopularVideos(categoryId = "0") {
    const params = {
      part: "snippet,statistics,contentDetails",
      chart: "mostPopular",
      regionCode: "IN",
      videoCategoryId: categoryId,
      maxResults: 24,
    };
    const data = await fetchYouTubeAPI("videos", params);
    if (data && data.items) {
      displayVideos(data.items);
    }
  }

  async function searchVideos(query) {
    const params = {
      part: "snippet",
      q: query,
      type: "video",
      maxResults: 12,
    };
    const data = await fetchYouTubeAPI("search", params);
    if (data && data.items) {
      const videoDetailsPromises = data.items.map((item) => {
        return fetchYouTubeAPI("videos", {
          part: "snippet,statistics,contentDetails",
          id: item.id.videoId,
        }).then((detailData) => detailData.items[0]);
      });
      const detailedVideos = await Promise.all(videoDetailsPromises);
      displayVideos(detailedVideos.filter((video) => video));
    }
  }

  async function fetchSearchSuggestions(query) {
    if (!query.trim()) {
      searchSuggestionsContainer.innerHTML = "";
      searchSuggestionsContainer.style.display = "none";
      return;
    }
    const suggestionsUrl = `/api/suggestions/${encodeURIComponent(query)}`;

    try {
      const response = await fetch(suggestionsUrl);
      if (!response.ok) {
        console.error("Suggestion API Error:", response.status);
        searchSuggestionsContainer.style.display = "none";
        return;
      }
      const text = await response.text();
      const startIndex = text.indexOf("(") + 1;
      const endIndex = text.lastIndexOf(")");
      const jsonData = JSON.parse(text.substring(startIndex, endIndex));

      displaySuggestions(jsonData[1]);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      searchSuggestionsContainer.style.display = "none";
    }
  }

  function displayVideos(videos) {
    videoGrid.innerHTML = "";
    videoPlayerContainer.style.display = "none";
    iframePlayer.src = "";

    if (!videos || videos.length === 0) {
      videoGrid.innerHTML = "<p>No videos found.</p>";
      return;
    }

    videos.forEach((video) => {
      const videoId =
        typeof video.id === "string" ? video.id : video.id.videoId;
      const snippet = video.snippet;
      const stats = video.statistics;
      const contentDetails = video.contentDetails;

      const videoCard = document.createElement("div");
      videoCard.classList.add("video-card");
      videoCard.dataset.videoId = videoId;
      const thumbnailUrl = snippet.thumbnails.medium.url;
      const title = snippet.title;
      const channelName = snippet.channelTitle;
      const viewCount = stats
        ? parseInt(stats.viewCount).toLocaleString()
        : "N/A";
      const publishedAt = new Date(snippet.publishedAt).toLocaleDateString();
      const duration = contentDetails
        ? formatDuration(contentDetails.duration)
        : "";

      videoCard.innerHTML = `
                <img src="${thumbnailUrl}" alt="${title}" class="thumbnail">
                <div class="video-info">
                    <h3 class="video-title">${title}</h3>
                    <p class="channel-name">${channelName}</p>
                    <p class="video-meta">Views: ${viewCount} &bull; Uploaded: ${publishedAt}</p>
                </div>
            `;
      videoCard.addEventListener("click", () => playVideo(videoId, title));
      videoGrid.appendChild(videoCard);
    });
  }

  function displaySuggestions(suggestions) {
    searchSuggestionsContainer.innerHTML = "";
    if (!suggestions || suggestions.length === 0) {
      searchSuggestionsContainer.style.display = "none";
      return;
    }

    suggestions.forEach((suggestionArray) => {
      const suggestionText = suggestionArray[0];
      const suggestionItem = document.createElement("div");
      suggestionItem.classList.add("suggestion-item");
      suggestionItem.textContent = suggestionText;
      suggestionItem.addEventListener("click", () => {
        searchBar.value = suggestionText;
        searchSuggestionsContainer.innerHTML = "";
        searchSuggestionsContainer.style.display = "none";
        searchVideos(suggestionText);
      });
      searchSuggestionsContainer.appendChild(suggestionItem);
    });
    searchSuggestionsContainer.style.display = "block";
  }

  function playVideo(videoId, title) {
    videoGrid.style.display = "none";
    videoPlayerContainer.style.display = "block";
    iframePlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    iframePlayer.title = title;
    videoPlayerContainer.scrollIntoView({ behavior: "smooth" });
  }

  function handleSearch() {
    const query = searchBar.value.trim();
    if (query) {
      searchVideos(query);
      searchSuggestionsContainer.innerHTML = "";
      searchSuggestionsContainer.style.display = "none";
    }
  }

  searchButton.addEventListener("click", handleSearch);
  searchBar.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      handleSearch();
    } else {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchSearchSuggestions(searchBar.value.trim());
      }, DEBOUNCE_DELAY);
    }
  });

  document.addEventListener("click", (event) => {
    if (!searchContainer.contains(event.target)) {
      searchSuggestionsContainer.innerHTML = "";
      searchSuggestionsContainer.style.display = "none";
    }
  });

  const searchContainer = document.querySelector(".search-container");

  homeLink.addEventListener("click", (e) => {
    e.preventDefault();
    videoGrid.style.display = "grid";
    videoPlayerContainer.style.display = "none";
    iframePlayer.src = "";
    searchBar.value = "";
    fetchPopularVideos();
  });

  function handleResize() {
    console.log("Window resized. Throttled execution.");
  }

  window.addEventListener("resize", () => {
    const now = Date.now();
    if (now - lastResizeTime > THROTTLE_DELAY) {
      handleResize();
      lastResizeTime = now;
    }
  });

  function handleScroll() {
    console.log("Window scrolled. Throttled execution.");
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 100
    ) {
      console.log("Near bottom, consider loading more videos (throttled)");
      loadMoreVideos();
    }
  }

  window.addEventListener("scroll", () => {
    const now = Date.now();
    if (now - lastScrollTime > THROTTLE_DELAY) {
      handleScroll();
      lastScrollTime = now;
    }
  });

  fetchPopularVideos();
});

function formatDuration(isoDuration) {
  if (!isoDuration) return "";
  const regex = /PT(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = isoDuration.match(regex);
  let minutes = 0;
  let seconds = 0;
  if (matches) {
    minutes = matches[1] ? parseInt(matches[1]) : 0;
    seconds = matches[2] ? parseInt(matches[2]) : 0;
  }
  if (minutes === 0 && seconds === 0) return "";
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}
