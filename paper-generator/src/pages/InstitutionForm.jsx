import { useState } from "react";
import { useNavigate } from "react-router-dom";

function InstitutionForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    institution: "",
    city: "",
    state: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.institution || !form.city || !form.state) {
      alert("Please fill all fields");
      return;
    }

    const role = localStorage.getItem("role");
    alert("Details saved successfully!");

    if (role === "teacher") {
      navigate("/teacher");
    } else {
      navigate("/student");
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <h1>🏫 Institution Details</h1>

        <input
          type="text"
          placeholder="Institution Name"
          name="institution"
          value={form.institution}
          onChange={handleChange}
        />
        <input
          type="text"
          placeholder="City"
          name="city"
          value={form.city}
          onChange={handleChange}
        />
        <input
          type="text"
          placeholder="State"
          name="state"
          value={form.state}
          onChange={handleChange}
        />

        <button onClick={handleSubmit}>Continue</button>
      </div>
    </div>
  );
}

export default InstitutionForm;
