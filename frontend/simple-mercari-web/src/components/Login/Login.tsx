import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import { fetcher } from "../../helper";

export const Login = () => {
  const [userID, setUserID] = useState<number>();
  const [password, setPassword] = useState<string>();
  const [_, setCookie] = useCookies(["userID", "token"]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const navigate = useNavigate();

  const onSubmit = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (!userID || !password) {
      setErrorMessage("Please fill out all fields");
      return;
    }
    fetcher<{ id: number; name: string; token: string }>(`/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userID,
        password: password,
      }),
    })
      .then((user) => {
        toast.success("Signed in!");
        console.log("POST success:", user.id);
        setCookie("userID", user.id);
        setCookie("token", user.token);
        navigate("/");
      })
      .catch((err) => {
        console.log(`POST error:`, err);
        toast.error(err.message);
        setErrorMessage("unauthorized");
      });
  };

  return (
    <div className="LoginContainer">
      <div className="Login">
        <label id="MerInputLabel">User ID</label>
        <input
          type="number"
          name="userID"
          id="MerTextInput"
          placeholder="UserID"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setUserID(Number(e.target.value));
          }}
          required
        />
        <label id="MerInputLabel">Password</label>
        <input
          type="password"
          name="password"
          id="MerTextInput"
          placeholder="password"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setPassword(e.target.value);
          }}
        />
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button onClick={onSubmit} id="MerButton">
          Login
        </button>
      </div>
    </div>
  );
};
