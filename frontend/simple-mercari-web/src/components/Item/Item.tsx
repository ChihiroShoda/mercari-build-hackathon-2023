import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetcher, fetcherBlob } from "../../helper";

interface Item {
  id: number;
  name: string;
  price: number;
  category_name: string;
}

interface FavoriteFolder {
  UserID: number;
  FavoriteFolderID: number;
  FavoriteFolderName: string;
}

type formDataType = {
  itemID: number;
  folder: number;
  existingFolder?: string;
  newFolder?: string;
};

export const Item: React.FC<{ item: Item }> = ({ item }) => {
  const initialState ={
    folder:0,
    itemID:0,
    existingFolder: "",
    newFolder: "",
  }
  const navigate = useNavigate();
  const [itemImage, setItemImage] = useState<string>("");
  const [cookies] = useCookies(["token"]);
  const [favoriteFolders, setFavoriteFolders] = useState<FavoriteFolder[]>([]);
  const [values, setValues] = useState<formDataType>(initialState);
  const [selectedRadioId, setSelectedRadioId] = useState<number | null>(null);

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

  const getFavoriteFolders = ()=> {
    fetcher<FavoriteFolder[]>(`/favorite`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cookies.token}`,
      },
    })
      .then((data) => setFavoriteFolders(data))
      .catch((err) => {
        console.log(`GET error:`, err);
        toast.error(err.message);
      });
    }
    
    useEffect(() => {
      async function fetchData() {
        const image = await getItemImage(item.id);
        setItemImage(URL.createObjectURL(image));
      }
  
      fetchData();
      getFavoriteFolders();
    }, [item]);
    
  const onClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const target =  event.currentTarget.parentElement;
    const icon = target?.querySelector("i");
    if(icon?.classList.contains("bi-heart-fill")){
      icon?.classList.remove("bi-heart-fill");
      icon?.classList.toggle("bi-heart");
      //! お気に入りフォルダから消す処理
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
    if (!values.existingFolder && !values.newFolder) {
      const icon = document.querySelector(".bi-heart-fill");
      icon?.classList.remove("bi-heart-fill");
      icon?.classList.toggle("bi-heart");
    }
    const modal = document.getElementById("id01");
    if (modal) {
      modal.style.display = "none";
    }
  };

  const onValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    });
  };

  const onRadioClick = (event: React.MouseEvent<HTMLInputElement>, folderId: number) => {
    if (selectedRadioId === folderId) {
      setSelectedRadioId(null);
      setValues({
        ...values,
        existingFolder: "",
        folder: 0,
      });
      event.currentTarget.checked = false;
    } else {
      setSelectedRadioId(folderId);
    }
  };
  
  const onRadioChange = (event: React.ChangeEvent<HTMLInputElement>, folderId: number) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
      folder: folderId,
    });
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
   
    if (!values.existingFolder && !values.newFolder || values.existingFolder && values.newFolder) {
      toast.error("Please select OR enter a folder name");
      return;
    }
    if (values.existingFolder) {
      const data = {
        item_id: values.itemID,
        folder_id: values.folder,
      };
      fetcher<{ id: number }>(`/favorite`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((data) => {
        console.log(`POST success:`, data);
        closeModal();
        toast.success("Item added to favorites");
      })
      .catch((error: Error) => {
        toast.error(error.message);
        console.error("POST error:", error);
      });
  
    } else {
      console.log("新しくフォルダを追加");
    }
  }

  return (
    <div className="w3-card-4 itemList">
    <img src={itemImage} alt="..." onClick={() => navigate(`/item/${item.id}`)}></img>
    <button onClick={onClick} id = "favorite">
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
      <form onSubmit={onSubmit}>
        {favoriteFolders.map((folder) => (
          <p key={folder.FavoriteFolderID}>
            <input
              className="w3-radio"
              type="radio"
              name="existingFolder"
              value={folder.FavoriteFolderName}
              onClick={(event) => onRadioClick(event, folder.FavoriteFolderID)}
              onChange={(event) => onRadioChange(event, folder.FavoriteFolderID)}
            />
            <label>{folder.FavoriteFolderName}</label>
          </p>
        ))}
        <input
              type="text"
              name="newFolder"
              id="MerTextInput"
              placeholder="+ New Folder"
              onChange={onValueChange}
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
      <p>￥{item.price}</p>
    </div>
  </div>
  );
};
