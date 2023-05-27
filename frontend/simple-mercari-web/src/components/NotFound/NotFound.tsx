import { useNavigate } from "react-router-dom";

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="Notfound">
        <p>Not Found</p>
        <button onClick={() => navigate("/")} id="MerButton">
          Back to SignUp/Login page
        </button>
      </div>
    </div>
  );
};
