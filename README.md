# YouTube Clone Project

This project is a simplified clone of the YouTube web application, created using HTML, CSS, and JavaScript. It fetches and displays videos from the YouTube Data API v3 and presents them in a dashboard layout.

## Deployed Link

I'll provide the deployed link here once ready

## Features

- **Homepage Dashboard**: Displays popular videos by default.
- **Video Cards**: Shows thumbnail, title, channel name, view count, and upload date.
- **Embedded Player**: Videos play in an iframe when a card is clicked.
- **Search Functionality**: Allows users to search for videos using the YouTube Data API.
- **Navigation Bar**: Includes a logo, search bar, and static links for Home, Trending, and Subscriptions.
- **Responsive Design**: Adapts to desktop and mobile screen sizes.

### Bonus Features Implemented

- **Search Suggestions with Debouncing**: As the user types in the search bar, suggestions are fetched from Google's suggestion API. API calls are debounced by 300ms to limit requests.
- **Throttling for Resize/Scroll Events**: Window resize and scroll event handlers are throttled to execute at most once every 250ms, improving performance for potential interactive features tied to these events.

## How to Run the Project Locally

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/saideep-priyadarshan/saideep_fs40_3701341.git
    cd saideep_fs40_3701341
    ```

2.  **Get a YouTube Data API v3 Key:**

    - Go to the [Google Developer Console](https://console.developers.google.com/).
    - Create a new project (or select an existing one).
    - Navigate to "APIs & Services" > "Library".
    - Search for "YouTube Data API v3" and enable it for your project.
    - Navigate to "APIs & Services" > "Credentials".
    - Click "Create Credentials" and choose "API key".
    - Copy the generated API key.

3.  **Add your API Key:**

    - Open the `script.js` file.
    - Find the line: `const apiKey = process.env.API_KEY;`
    - Replace `process.env.API_KEY` with the API key you obtained.

4.  **Open `index.html` in your browser:**

    - You can simply double-click the `index.html` file, or use a live server extension if you have one in your code editor (like VS Code's "Live Server").

    - **CORS Issue with `suggestqueries.google.com`**: The bonus feature for search suggestions uses `https://suggestqueries.google.com/complete/search`. When running locally, your browser might block these requests due to CORS (Cross-Origin Resource Sharing) policies.
      - **For Development/Testing**:
        - You can use a browser extension that disables CORS (e.g., "Allow CORS: Access-Control-Allow-Origin" for Chrome). **Remember to disable this extension after testing as it can be a security risk.**
        - The `script.js` includes a placeholder for a CORS proxy (`https://cors-anywhere.herokuapp.com/`). You might need to visit this proxy's page once to activate it for your browser session. Public proxies can be unreliable.
      - **For Deployment**: The best solution is to have a small backend service that proxies these requests for you. For this assignment, if deploying statically, the suggestion feature might not work reliably without a proxy configured on the hosting platform or if the public proxy is down.

## YouTube API Implementation

- **Fetching Data**: The `script.js` file uses the `fetch` API to make GET requests to the YouTube Data API v3.
  - **Popular Videos**: On page load, it calls the `/videos` endpoint with `chart=mostPopular` to get a list of trending videos.
  - **Search**: When a user searches, it calls the `/search` endpoint with the query (`q` parameter) and `type=video`. The search results provide video IDs, so an additional call to the `/videos` endpoint is made for each video ID to get detailed statistics like view count.
- **API Key**: The API key is included as a query parameter in each request.
- **Displaying Videos**: The fetched video data (thumbnails, titles, channel names, statistics) is dynamically used to create "video cards" in the HTML.
- **Embedding Videos**: The YouTube IFrame Player API is used for embedding. When a video card is clicked, the `src` attribute of an `<iframe>` element is updated to `https://www.youtube.com/embed/VIDEO_ID?autoplay=1` to load and play the selected video.

## Debouncing and Throttling Implementation

- **Debouncing (Search Suggestions)**:

  - Implemented for the search bar input.
  - When the user types, a timer (`debounceTimer`) is set for 300ms.
  - If the user types again before the timer elapses, the previous timer is cleared, and a new one is set.
  - The API call to fetch search suggestions (`fetchSearchSuggestions`) is only made after the user has paused typing for 300ms.
  - This is achieved using `setTimeout` and `clearTimeout`.

- **Throttling (Scroll/Resize Events)**:
  - Implemented for `window.onscroll` and `window.onresize` event listeners.
  - A `THROTTLE_DELAY` of 250ms is defined.
  - Event handlers (`handleScroll`, `handleResize`) are only allowed to execute if at least 250ms have passed since their last execution.
  - This is managed by storing the timestamp of the last execution (`lastScrollTime`, `lastResizeTime`) and comparing it with the current time (`Date.now()`).
  - This prevents the event handlers from firing too frequently during continuous scrolling or resizing, which can improve performance.
