import { useEffect, useState } from 'react';
import { useApiGet } from '../hooks/useApiGet';
import '../styles/HomeView.scss';
import { GiphyDTO } from '../types/GiphyDTO';

const HomeView = () => {
  const { get: getGifs, error: errorGifs, loading: loadingGifs } = useApiGet<GiphyDTO>();
  const { get: getHistory, error: errorHistory, loading: loadingHistory } = useApiGet<string[]>();
  const [data, setData] = useState<any[] | null>(null);
  const [page, setPage] = useState<number>(0);
  const [query, setQuery] = useState<string>('');

  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<string[]>([]);

  const limit = 10;
  const offset = page * limit;

  /**
   * Get gifs from Giphy API
   */
  const handleGetGifs = () => {
    getGifs(
      `https://api.giphy.com/v1/gifs/search?api_key=pLURtkhVrUXr3KG25Gy5IvzziV5OrZGa&q=${query}&limit=${limit}&offset=${offset}`,
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
  const getSearchHistory = () => {
    getHistory('/search-history').then((response) => {
      if (response) {
        setHistoryList(response);
      }
    });
  };

  useEffect(() => {
    handleGetGifs();
  }, [page]);

  useEffect(() => {
    getSearchHistory();
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
    if (e.key === 'Enter') {
      handleGetGifs();
    }
  };

  /**
   * Handle clear button click, to clear query and data
   */
  const handleClear = () => {
    setQuery('');
    setData(null);
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

  const handleFocus = (show: boolean) => {
    setShowHistory(show);
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
          {showHistory && (
            <ul className="search-history">
              <li>Test1</li>
              <li>Test2</li>
            </ul>
          )}
        </div>
        <button onClick={handleGetGifs}>Search</button>
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
