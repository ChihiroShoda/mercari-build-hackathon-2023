import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import "./Header.css";

export const Header: React.FC = () => {
  const [cookies, _, removeCookie] = useCookies(["userID", "token"]);
  const navigate = useNavigate();

  const onLogout = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    removeCookie("userID");
    removeCookie("token");
    navigate("/");
  };

  return (
    <>
    <head>
    <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css"></link>
    {/*//!bootstrapだと なぜかheaderが崩れる*/}
    {/* <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-KK94CHFLLe+nY2dmCWGMq91rCGa5gtU4mk92HdvYe+M/SXH301p5ILy+dN9+nJOZ" crossOrigin="anonymous"></link> */}
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css"></link>
    </head>
      <header className="header">
        <p>
          <a href="/">MiniMercari</a>
        </p>
        <div className="ButtonContainer">
          <button  onClick={() => navigate("/")}>
            <i className="bi bi-house-door-fill"></i>
          </button>
          <button onClick={() => navigate(`/user/${cookies.userID}`)}>
            <i className="bi bi-person-fill"></i>
          </button>
          <button onClick={() => navigate(`/favorite`)}>
            <i className="bi bi-heart-fill"></i>
          </button>
          <button onClick={onLogout}>
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </header>
    </>
  );
}
