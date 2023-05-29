import { useRef, useState, useEffect } from "react";
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
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<number | null>(null);

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
  
    const checkFavoriteStatus = (itemId: number) => {
      fetcher<boolean>(`/favorite/check/${itemId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies.token}`,
          },
        })
        .then((data) => setIsFavorite(data))
        .catch((err) => {
          console.log(`GET error:`, err);
          toast.error(err.message);
        });
    };

    const deleteFavoriteItem = (itemID: number) => {
      //!どのフォルダにはいってるか調べる
      fetcher(`/favorite/delete`, {
        method: "POST",
        body: JSON.stringify({
          item_id: itemID,
          folder_id: values.folder,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies.token}`,
        },
      })
        .then((res) => {
          console.log("DELETE success:", res);
          toast.success("Deleted from favorite");
        })
        .catch((err) => {
          console.log(`DELETE error:`, err);
          toast.error(err.message);
        });
    }
    
    useEffect(() => {
      async function fetchData() {
        const image = await getItemImage(item.id);
        setItemImage(URL.createObjectURL(image));
      }
       
      fetchData();
      checkFavoriteStatus(item.id);
      getFavoriteFolders();
    }, [item.id]);
    
  const onClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setActiveModal(item.id);
    const target =  event.currentTarget.parentElement;
    const icon = target?.querySelector("i");
    if(icon?.classList.contains("bi-heart-fill")){
      icon?.classList.remove("bi-heart-fill");
      icon?.classList.toggle("bi-heart");
      // deleteFavoriteItem(item.id);
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
    setActiveModal(null);
    // if (!values.existingFolder && !values.newFolder) {
    //   const target = document.getElementById("favorite");
    //   const icon = target?.querySelector("i");
    //   icon?.classList.remove("bi-heart-fill");
    //   icon?.classList.toggle("bi-heart");
    // }
    const modal = document.getElementById("id01");
    if (modal) {
      modal.style.display = "none";
    }
  };

  const onValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({
      ...values,
      newFolder: event.target.value,
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
      existingFolder: event.target.value,
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
        item_id:activeModal,
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
      const data ={
        "folder_name": values.newFolder,
      }
      fetcher<{ id: number }>(`/favorite/new`, {
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
        getFavoriteFolders();
        setValues({ ...values, newFolder: "" });
        const inputElements = document.getElementsByClassName("newFolderInput");
        if (inputElements.length > 0) {
          const inputElement = inputElements[0] as HTMLInputElement;
          inputElement.value = ""; // 入力フィールドをクリアする
        }
        toast.success("New Folder added");
      })
      .catch((error: Error) => {
        toast.error(error.message);
        console.error("POST error:", error);
      });
    }
  }

  return (
    <div className="w3-card-4 itemList">
    <img src={itemImage} alt="..." onClick={() => navigate(`/item/${item.id}`)}></img>
    <button onClick={onClick} id = "favorite">
    <i className={`bi ${isFavorite ? "bi-heart-fill" : "bi-heart"}`}></i>
    </button>
      {activeModal !== null && activeModal === item.id && (
      <div id="id01" className="w3-modal">
      <div className="w3-modal-content">
        <header className="w3-container"> 
          <span onClick={closeModal} 
          className="w3-button w3-display-topright">&times;</span>
          <h2>Folders</h2>
        </header>
        <div className="w3-container" id="select-folder">
        <form onSubmit={onSubmit}>
          {favoriteFolders && favoriteFolders.map((folder) => (
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
                className="newFolderInput"
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
  )}
    <div className="w3-container w3-center">
      <b>{item.name}</b>
      <p>￥{item.price}</p>
    </div>
  </div>
  );
};
