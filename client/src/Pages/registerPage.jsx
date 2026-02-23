import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    leetcodeUsername: ""
  });
  const navigate=useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit =async (e) => {
    e.preventDefault();
    console.log("Register Data:", formData);
    try{
      await axios.post("http://localhost:5000/api/user/register",formData);
      alert("Registeration done");
      navigate("/login");
    }
    catch(error){
      console.log(error);
      alert("Registeration failed");
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2>Create CodePulse Account</h2>

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

        <input
          type="text"
          name="leetcodeUsername"
          placeholder="LeetCode Username"
          required
          onChange={handleChange}
        />

        <button type="submit">Register</button>

        <p>
          Already have an account? <a href="/login">Login</a>
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

export default RegisterPage;