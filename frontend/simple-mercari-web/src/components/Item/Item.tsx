import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { fetcherBlob } from "../../helper";

interface Item {
  id: number;
  name: string;
  price: number;
  category_name: string;
}

export const Item: React.FC<{ item: Item }> = ({ item }) => {
  const navigate = useNavigate();
  const [itemImage, setItemImage] = useState<string>("");
  const [cookies] = useCookies(["token"]);

  async function getItemImage(itemId: number): Promise<Blob> {
    return await fetcherBlob(`/items/${itemId}/image`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${cookies.token}`,
      },
    });
  }

  useEffect(() => {
    async function fetchData() {
      const image = await getItemImage(item.id);
      setItemImage(URL.createObjectURL(image));
    }

    fetchData();
  }, [item]);

  const onSubmit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const target =  event.currentTarget.parentElement;
    const icon = target?.querySelector("i");
    if(icon?.classList.contains("bi-heart-fill")){
      icon?.classList.remove("bi-heart-fill");
      icon?.classList.toggle("bi-heart");
    }else{
      icon?.classList.remove("bi-heart");
      icon?.classList.toggle("bi-heart-fill");
      const modal = document.getElementById("id01");
      if (modal) {
        modal.style.display = "block";
      }
    }
  }; 

  const closeModal = () => {
    const modal = document.getElementById("id01");
    if (modal) {
      modal.style.display = "none";
    }
  };

  return (
    <div className="w3-card-4 itemList">
    <img src={itemImage} alt="..." onClick={() => navigate(`/item/${item.id}`)}></img>
    <button onClick={onSubmit} id = "favorite">
      <i className="bi bi-heart"></i>
    </button>
    <div id="id01" className="w3-modal">
    <div className="w3-modal-content">
      <header className="w3-container"> 
        <span onClick={closeModal} 
        className="w3-button w3-display-topright">&times;</span>
        <h2>Folders</h2>
      </header>
      <div className="w3-container" id="select-folder">
      <form>
        <p>
        <input className="w3-radio" type="radio" name="gender" value="male" checked/>
        <label>Male</label>
        </p>
        <p>
        <input className="w3-radio" type="radio" name="gender" value="female"/>
        <label>Female</label>
        </p>
        <input
              type="text"
              name="name"
              id="MerTextInput"
              placeholder="+ New Folder"
        />
         <button type="submit" id="MerButton">
              Register
        </button>
      </form>
      </div>
    </div>
  </div>
    <div className="w3-container w3-center">
      <b>{item.name}</b>
      <p>{item.price}</p>
    </div>
  </div>
  );
};
