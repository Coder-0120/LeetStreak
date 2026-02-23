import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

interface RegisterForm {
  email: string;
  password: string;
  leetcodeUsername: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterForm>({
    email: "",
    password: "",
    leetcodeUsername: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/api/user/register",
        formData
      );

      alert("Registration successful 🎉");

      navigate("/login"); // redirect after success
    } catch (error: any) {
      alert(error?.response?.data?.message || "Registration failed");
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
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          value={formData.password}
          onChange={handleChange}
        />

        <input
          type="text"
          name="leetcodeUsername"
          placeholder="LeetCode Username"
          required
          value={formData.leetcodeUsername}
          onChange={handleChange}
        />

        <button type="submit">Register</button>

        <p>
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

const styles: {
  container: React.CSSProperties;
  form: React.CSSProperties;
} = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  form: {
    width: "320px",
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  }
};

export default RegisterPage;