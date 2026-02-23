import { useState } from "react";
import axios from "axios";

interface RegisterForm {
  email: string;
  password: string;
  leetcodeUsername: string;
}

const RegisterPage = () => {
  const [formData, setFormData] = useState<RegisterForm>({
    email: "",
    password: "",
    leetcodeUsername: ""
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/api/user/register",
        formData
      );
      alert("Registration successful");
    } catch (error: any) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return <div>Register Page</div>;
};

export default RegisterPage;