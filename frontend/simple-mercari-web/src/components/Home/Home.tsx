import { Login } from "../Login";
import { Signup } from "../Signup";
import { ItemList } from "../ItemList";
import { useCookies } from "react-cookie";
import { MerComponent } from "../MerComponent";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetcher } from "../../helper";
import "react-toastify/dist/ReactToastify.css";

interface Item {
  id: number;
  name: string;
  price: number;
  category_name: string;
}
export const Home = () => {
  const [cookies] = useCookies(["userID", "token"]);
  const [items, setItems] = useState<Item[]>([]);
  const [searchText, setSearchText] = useState("");

  const fetchItems = () => {
    fetcher<Item[]>(`/items`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((data) => {
        console.log("GET success:", data);
        setItems(data);
      })
      .catch((err) => {
        console.log(`GET error:`, err);
        toast.error(err.message);
      });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const searchQuery = searchText.trim();
    console.log(searchQuery)
    if (searchQuery) {
      fetcher(`/search?name=${searchQuery}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
        .then((data) => {
          console.log("GET success:", data);
          setItems(data);
        })
        .catch((err) => {
          console.log(`GET error:`, err);
          toast.error(err.message);
        });
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const signUpAndSignInPage = (
    <div className="SigninContainer">
      <div>
        <Signup />
      </div>
      <p>or</p>
      <div>
        <Login />
      </div>
    </div>
  );

  const itemListPage = (
    <MerComponent>
        <div className="IdandSearch">
          <span>
            <p>Logined User ID: {cookies.userID}</p>
          </span>
          <div className="SearchBar">
          <form id="form1" onSubmit={handleFormSubmit}>
            <div className="input-container">
              <input
                id="sbox"
                name="s"
                type="text"
                placeholder="Type keyword"
                value={searchText}
                onChange={handleInputChange}
              />
              <input id="sbtn" type="submit" value="Search" />
            </div>
          </form>
        </div>
       </div>
        <ItemList items={items} />
    </MerComponent>
  );

  return <>{cookies.token ? itemListPage : signUpAndSignInPage}</>;
};
