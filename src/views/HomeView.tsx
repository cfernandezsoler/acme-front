import { useEffect, useState } from "react";
import { useApiGet } from "../hooks/useApiGet";
import { useApiSave } from "../hooks/useApiSave";
import "../styles/HomeView.scss";
import { GiphyDTO } from "../types/GiphyDTO";
import { SearchHistoryReqDTO } from "../types/SearchHistoryDTO";

const HomeView = () => {
  const {
    get: getGifs,
    error: errorGifs,
    loading: loadingGifs,
  } = useApiGet<GiphyDTO>();
  const {
    get: getHistory,
    error: errorHistory,
    loading: loadingHistory,
  } = useApiGet<string[]>();

  const {
    save: saveHistory,
    error: errorSaveHistory,
    loading: loadingSaveHistory,
  } = useApiSave<SearchHistoryReqDTO, null>();

  const [data, setData] = useState<any[] | null>(null);
  const [page, setPage] = useState<number>(0);
  const [query, setQuery] = useState<string>("");

  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<string[]>([]);
  const [blurTimeoutId, setBlurTimeoutId] = useState<NodeJS.Timeout | null>(
    null
  ); // Timeout id to delay the execution of handleFocus (hack for the input and ul to not close when clicking on the history)

  const limit = 10;
  const offset = page * limit;

  /**
   * Get gifs from Giphy API
   */
  const handleGetGifs = (forceQuery?: string) => {
    getGifs(
      `https://api.giphy.com/v1/gifs/search?api_key=pLURtkhVrUXr3KG25Gy5IvzziV5OrZGa&q=${
        forceQuery ?? query
      }&limit=${limit}&offset=${offset}`,
      true
    ).then((response) => {
      if (response) {
        setData(response.data);
      }
    });
  };

  /**
   * Get search history from base backend API
   */
  const handleGetSearchHistory = () => {
    const url = query ? `/search-history?query=${query}` : "/search-history";
    getHistory(url).then((response) => {
      if (response) {
        setHistoryList(response);
      }
    });
  };

  const handleSaveNewSearch = () => {
    saveHistory("/search-history/new", { search: query });
  };

  useEffect(() => {
    handleGetGifs();
  }, [page]);

  useEffect(() => {
    handleGetSearchHistory();
  }, [query]);

  /**
   * Handle input change
   * @param e - React.FormEvent<HTMLInputElement>
   */
  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    setQuery(e.currentTarget.value);
  };

  /**
   * Handle key down enter event, to get gifs
   * @param e - Keyboard Event
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(true);
    }
  };

  const handleSearch = (saveNewSearch: boolean, forceQuery?: string) => {
    handleGetGifs(forceQuery);
    if (saveNewSearch) handleSaveNewSearch();
  };

  /**
   * Handle clear button click, to clear query and data
   */
  const handleClear = () => {
    setQuery("");
    setData(null);
  };

  const handleFocus = (show: boolean) => {
    if (!show) {
      // Set a timeout to delay the execution of handleFocus
      const timeoutId = setTimeout(() => {
        setShowHistory(show);
      }, 50);

      setBlurTimeoutId(timeoutId);
    } else {
      setShowHistory(show);
    }
    handleGetSearchHistory();
  };

  const handleHistoryClick = (query: string) => {
    // Clear the timeout when a history item is clicked
    if (blurTimeoutId) clearTimeout(blurTimeoutId);

    setQuery(query);
    handleSearch(false, query);
  };

  /**
   * Renders data from Giphy API based on query, page and result of the API call.
   * @returns JSX.Element
   */
  const renderData = () => {
    if (!query && data == null) {
      return <div>Please enter a search term.</div>;
    }
    if (loadingGifs) {
      return <div>Loading...</div>;
    }
    if (errorGifs) {
      return <div>There was an error in the request. Please try again.</div>;
    }
    if (data && !data.length) {
      return <div>No results found. Please try another search term.</div>;
    }
    return data?.map((it) => (
      <div key={it.id}>
        <img src={it.images.original.webp} alt={it.title} />
      </div>
    ));
  };

  return (
    <div className="home-view">
      <h1>Search your gifs</h1>
      <div className="form">
        <div className="input-container">
          <input
            type="text"
            placeholder="Insert your search (ex: cats)"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            value={query}
            onFocus={() => handleFocus(true)}
            onBlur={() => handleFocus(false)}
          />
          {showHistory &&
            (loadingHistory ? (
              <div>Loading...</div>
            ) : (
              <ul className="search-history">
                {historyList.map((it) => (
                  <li
                    key={`history-${it}`}
                    onMouseDown={() => handleHistoryClick(it)}
                  >
                    {it}
                  </li>
                ))}
              </ul>
            ))}
        </div>
        <button onClick={() => handleSearch(true)}>Search</button>
        <button onClick={handleClear}>Clear</button>
      </div>
      <div className="pagination">
        <button onClick={() => setPage(page - 1)} disabled={page === 0}>
          Previous
        </button>
        <button onClick={() => setPage(page + 1)}>Next</button>
      </div>

      <div className="grid">{renderData()}</div>
    </div>
  );
};

export default HomeView;
