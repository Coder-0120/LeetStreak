import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const navigate=useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    console.log("Login Data:", formData);
    try{
      await axios.post("http://localhost:5000/api/user/login",formData);
      alert("login successfully ");
      localStorage.setItem("userInfo",JSON.stringify(formData));
      navigate("/dashboard");
    }
    catch(error){
      console.log(error);
      alert("login failed");
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2>Login to CodePulse</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          onChange={handleChange}
        />

        <button type="submit">Login</button>

        <p>
          Don’t have an account? <a href="/register">Register</a>
        </p>
      </form>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  form: {
    width: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  }
};

export default LoginPage;