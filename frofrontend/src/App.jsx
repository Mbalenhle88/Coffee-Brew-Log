import { useEffect, useState } from "react";

const API = "http://localhost:5000/api/brews";

function App() {
  const [brews, setBrews] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [beanName, setBeanName] = useState("");
  const [brewMethod, setBrewMethod] = useState("");
  const [coffee, setCoffee] = useState("");
  const [water, setWater] = useState("");
  const [brewingTime, setBrewingTime] = useState("");
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState("");

  const loadBrews = async () => {
    try {
      const response = await fetch(API);
      const data = await response.json();
      setBrews(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadBrews();
  }, []);

  const clearForm = () => {
    setBeanName("");
    setBrewMethod("");
    setCoffee("");
    setWater("");
    setBrewingTime("");
    setNotes("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !beanName.trim() ||
      !brewMethod.trim() ||
      !coffee ||
      !water ||
      !brewingTime.trim() ||
      !notes.trim()
    ) {
      alert("Please complete all fields.");
      return;
    }

    const brew = {
      beanName,
      brewMethod,
      coffeeGrams: Number(coffee),
      waterGrams: Number(water),
      brewingTime,
      notes,
    };

    try {
      const url = editingId ? `${API}/${editingId}` : API;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(brew),
      });

      if (!response.ok) {
        throw new Error("Could not save brew");
      }

      clearForm();
      loadBrews();
    } catch (error) {
      console.error(error);
      alert("Could not save brew. Please check that the backend is running.");
    }
  };

  const editBrew = (brew) => {
    setEditingId(brew.id);
    setBeanName(brew.beanName || brew.name || "");
    setBrewMethod(brew.brewMethod || "");
    setCoffee(brew.coffeeGrams || brew.coffee || "");
    setWater(brew.waterGrams || brew.water || "");
    setBrewingTime(brew.brewingTime || "");
    setNotes(brew.notes || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteBrew = async (id) => {
    if (!window.confirm("Delete this brew?")) return;

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      loadBrews();
    } catch (error) {
      console.error(error);
      alert("Could not delete brew.");
    }
  };

  const filteredBrews = filter
    ? brews.filter((brew) => brew.brewMethod === filter)
    : brews;

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Brews: {brews.length}</h1>

      <h2>{editingId ? "Edit Brew" : "Add New Brew"}</h2>

      <form onSubmit={handleSubmit}>
        <input
          value={beanName}
          onChange={(e) => setBeanName(e.target.value)}
          placeholder="Bean Name"
        />

        <br /><br />

        <select
          value={brewMethod}
          onChange={(e) => setBrewMethod(e.target.value)}
        >
          <option value="">Select Brew Method</option>
          <option value="French Press">French Press</option>
          <option value="Flat White">Flat White</option>
          <option value="Pour Over">Pour Over</option>
          <option value="Espresso">Espresso</option>
          <option value="AeroPress">AeroPress</option>
          <option value="Chemex">Chemex</option>
        </select>

        <br /><br />

        <input
          type="number"
          value={coffee}
          onChange={(e) => setCoffee(e.target.value)}
          placeholder="Coffee (grams)"
        />

        <br /><br />

        <input
          type="number"
          value={water}
          onChange={(e) => setWater(e.target.value)}
          placeholder="Water (grams)"
        />

        <br /><br />

        <input
          type="text"
          value={brewingTime}
          onChange={(e) => setBrewingTime(e.target.value)}
          placeholder="Brewing Time"
        />

        <br /><br />

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tasting Notes"
        />

        <br /><br />

        <button type="submit">
          {editingId ? "Update Brew" : "Add Brew"}
        </button>

        {editingId && (
          <button type="button" onClick={clearForm}>
            Cancel
          </button>
        )}
      </form>

      <hr />

      <h2>Your Brews</h2>

      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="">All Brew Methods</option>
        {[...new Set(brews.map((brew) => brew.brewMethod))]
          .filter(Boolean)
          .map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
      </select>

      {filteredBrews.length === 0 ? (
        <p>No brews yet. Add one above!</p>
      ) : (
        filteredBrews.map((brew) => {
          const coffeeAmount = Number(
            brew.coffeeGrams || brew.coffee || 0
          );
          const waterAmount = Number(
            brew.waterGrams || brew.water || 0
          );

          const ratio =
            coffeeAmount > 0
              ? (waterAmount / coffeeAmount).toFixed(1)
              : "0";

          return (
            <div
              key={brew.id}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                marginTop: "15px",
                borderRadius: "8px",
              }}
            >
              <h3>{brew.beanName || brew.name}</h3>

              <p>Method: {brew.brewMethod}</p>
              <p>Coffee: {coffeeAmount}g</p>
              <p>Water: {waterAmount}g</p>
              <p>Ratio: 1:{ratio}</p>
              <p>Brewing Time: {brew.brewingTime}</p>
              <p>Notes: {brew.notes}</p>

              <button onClick={() => editBrew(brew)}>
                Edit
              </button>

              <button onClick={() => deleteBrew(brew.id)}>
                Delete
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}

export default App;