

import { useEffect, useState } from "react";

import "./App.css";



const API = "http://localhost:8081/items";
const AUTH_API = "http://localhost:8081/auth";



const emptyForm = {

  title: "",

  type: "LOST",

  category: "",

  date: "",

  description: "",

  location: "",

  contactName: "",

  contactEmail: "",

  contactPhone: "",

  status: "OPEN",

};



export default function App() {

  const [page, setPage] = useState("home");

  const [user, setUser] = useState(

    () => localStorage.getItem("finditUser") || ""

  );

  const [items, setItems] = useState([]);

  const [form, setForm] = useState(emptyForm);
  
  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("ALL");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [auth, setAuth] = useState({

    name: "",

    email: "",

    password: "",

  });

  const [authMode, setAuthMode] = useState("login");



  async function loadItems() {

    setLoading(true);

    try {

      const response = await fetch(API);

      if (!response.ok) throw new Error("Could not load items");

      const data = await response.json();

      setItems(Array.isArray(data) ? data : []);

    } catch {

      setMessage(

        "Cannot connect to backend. Make sure Spring Boot is running on port 8081."

      );

    } finally {

      setLoading(false);

    }

  }



  useEffect(() => {

    loadItems();

  }, []);



  function updateForm(event) {

    setForm({ ...form, [event.target.name]: event.target.value });

  }



  async function submitItem(event) {

    event.preventDefault();

    setMessage("");



    try {

      const response = await fetch(API, {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(form),

      });



      if (!response.ok) {

        throw new Error("Could not save item");

      }



      setMessage("Item posted successfully!");

      setForm(emptyForm);

      await loadItems();

      setPage("items");

    } catch {

      setMessage(

        "Unable to post item. Check the backend, required fields, and date format."

      );

    }

  }



  async function deleteItem(id) {

    if (!window.confirm("Are you sure you want to delete this item?")) {

      return;

    }



    try {

      const response = await fetch(`${API}/${id}`, {

        method: "DELETE",

      });

      if (!response.ok) throw new Error("Delete failed");

      setMessage("Item deleted successfully.");

      await loadItems();

    } catch {

      setMessage("Could not delete the item.");

    }

  }



  async function handleAuth(event) {
    event.preventDefault();
    setMessage("");

    if (authMode === "register" && !auth.name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    if (!auth.email.trim() || !auth.password) {
      setMessage("Please enter your email and password.");
      return;
    }

    if (auth.password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    try {
      const endpoint = authMode === "login" ? "/login" : "/register";
      const payload =
        authMode === "login"
          ? { email: auth.email.trim(), password: auth.password }
          : {
              name: auth.name.trim(),
              email: auth.email.trim(),
              password: auth.password,
            };

      const response = await fetch(`${AUTH_API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Authentication failed.");
      }

      const loggedInUser = data.email || auth.email.trim();
      localStorage.setItem("finditUser", loggedInUser);
      setUser(loggedInUser);
      setMessage(data.message || "Success!");
      setPage("home");
      setAuth({ name: "", email: "", password: "" });
    } catch (error) {
      setMessage(
        error.message ||
          "Could not connect to the backend. Make sure Spring Boot is running on port 8081."
      );
    }
  }

  function logout() {

    localStorage.removeItem("finditUser");

    setUser("");

    setPage("home");

    setMessage("You have signed out.");

  }



  const filteredItems = items.filter((item) => {

    const term = search.toLowerCase().trim();

    const matchesSearch = [

      item.title,

      item.description,

      item.category,

      item.location,

    ].some((value) => String(value || "").toLowerCase().includes(term));



    const matchesType =

      filter === "ALL" ||

      String(item.type || "").toUpperCase() === filter;



    return matchesSearch && matchesType;

  });



  return (

    <div className="app">

      <header className="navbar">

        <button className="brand" onClick={() => setPage("home")}>

          🔎 FindIt

        </button>



        <nav>

          <button onClick={() => setPage("items")}>Explore Items</button>

          <button onClick={() => setPage("post")}>Post an Item</button>

          {user ? (

            <>

              <span className="welcome">Hi, {user.split("@")[0]}</span>

              <button onClick={logout}>Logout</button>

            </>

          ) : (

            <button className="primary small" onClick={() => setPage("auth")}>

              Login / Register

            </button>

          )}

        </nav>

      </header>



      {message && (

        <div className="notice" role="status">

          {message}

          <button onClick={() => setMessage("")}>✕</button>

        </div>

      )}



      {page === "home" && (

        <>

          <section className="hero">

            <p className="eyebrow">LOST SOMETHING? FOUND SOMETHING?</p>

            <h1>Let's help it find its way home.</h1>

            <p>

              Report lost belongings and help reunite people with their items.

            </p>

            <button className="primary" onClick={() => setPage("items")}>

              Explore Items

            </button>

            <button className="secondary" onClick={() => setPage("post")}>

              Post an Item

            </button>

          </section>



          <section className="section">

            <div className="section-heading">

              <div>

                <h2>Recently Reported Items</h2>

                <p>Help someone find what they have lost.</p>

              </div>

              <button className="text-button" onClick={() => setPage("items")}>

                View all →

              </button>

            </div>

            <ItemGrid

              items={items.slice(0, 3)}

              onDelete={deleteItem}

              user={user}

            />

          </section>

        </>

      )}



      {page === "items" && (

        <section className="section page-section">

          <h1>Explore Items</h1>

          <p>Search for lost belongings and found items.</p>



          <div className="filters">

            <input

              placeholder="Search title, category or location..."

              value={search}

              onChange={(e) => setSearch(e.target.value)}

            />

            <select value={filter} onChange={(e) => setFilter(e.target.value)}>

              <option value="ALL">All items</option>

              <option value="LOST">Lost</option>

              <option value="FOUND">Found</option>

            </select>

            <button className="secondary" onClick={loadItems}>

              Refresh

            </button>

          </div>



          {loading ? (

            <p>Loading items...</p>

          ) : (

            <ItemGrid

              items={filteredItems}

              onDelete={deleteItem}

              user={user}

            />

          )}

        </section>

      )}



      {page === "post" && (

        <section className="form-card">

          <h1>Post a Lost or Found Item</h1>

          <p>Fill in the details below to share an item.</p>



          <form onSubmit={submitItem}>

            <div className="form-grid">

              <label>

                Item title \*

                <input

                  name="title"

                  value={form.title}

                  onChange={updateForm}

                  placeholder="e.g. Black Wallet"

                  required

                />

              </label>



              <label>

                Item type \*

                <select name="type" value={form.type} onChange={updateForm}>

                  <option value="LOST">I lost this</option>

                  <option value="FOUND">I found this</option>

                </select>

              </label>



              <label>

                Category \*

                <input

                  name="category"

                  value={form.category}

                  onChange={updateForm}

                  placeholder="Wallet, phone, ID card..."

                  required

                />

              </label>



              <label>

                Date \*

                <input

                  type="date"

                  name="date"

                  value={form.date}

                  onChange={updateForm}

                  required

                />

              </label>



              <label className="full">

                Description \*

                <textarea

                  name="description"

                  value={form.description}

                  onChange={updateForm}

                  placeholder="Describe the item..."

                  required

                />

              </label>



              <label>

                Location \*

                <input

                  name="location"

                  value={form.location}

                  onChange={updateForm}

                  placeholder="Where was it lost or found?"

                  required

                />

              </label>



              <label>

                Contact name \*

                <input

                  name="contactName"

                  value={form.contactName}

                  onChange={updateForm}

                  required

                />

              </label>



              <label>

                Contact email \*

                <input

                  type="email"

                  name="contactEmail"

                  value={form.contactEmail}

                  onChange={updateForm}

                  required

                />

              </label>



              <label>

                Contact phone

                <input

                  name="contactPhone"

                  value={form.contactPhone}

                  onChange={updateForm}

                />

              </label>

            </div>



            <button className="primary submit-button" type="submit">

              Submit Item

            </button>

          </form>

        </section>

      )}



      {page === "auth" && (

        <section className="auth-card">

          <div className="auth-icon">🔎</div>

          <h1>{authMode === "login" ? "Welcome Back!" : "Create an Account"}</h1>

          <p>

            {authMode === "login"

              ? "Sign in to your FindIt account."

              : "Join the FindIt community."}

          </p>



          <div className="auth-tabs">

            <button

              className={authMode === "login" ? "active" : ""}

              onClick={() => setAuthMode("login")}

              type="button"

            >

              Login

            </button>

            <button

              className={authMode === "register" ? "active" : ""}

              onClick={() => setAuthMode("register")}

              type="button"

            >

              Register

            </button>

          </div>



          <form onSubmit={handleAuth}>

            {authMode === "register" && (

              <label>

                Full name

                <input

                  value={auth.name}

                  onChange={(e) =>

                    setAuth({ ...auth, name: e.target.value })

                  }

                  placeholder="Your name"

                  required

                />

              </label>

            )}



            <label>

              Email address

              <input

                type="email"

                value={auth.email}

                onChange={(e) =>

                  setAuth({ ...auth, email: e.target.value })

                }

                placeholder="you@example.com"

                required

              />

            </label>



            <label>

              Password

              <input

                type="password"

                value={auth.password}

                onChange={(e) =>

                  setAuth({ ...auth, password: e.target.value })

                }

                placeholder="At least 6 characters"

                minLength={6}

                required

              />

            </label>



            <button className="primary submit-button" type="submit">

              {authMode === "login" ? "Login" : "Register"}

            </button>

          </form>



          <p className="demo-warning">
              Your account is checked by the backend. Keep your password private.
          </p>

        </section>

      )}



      <footer>

        <strong>🔎 FindIt</strong>

        <p>Helping lost belongings find their way home.</p>

      </footer>

    </div>

  );

}



function ItemGrid({ items, onDelete, user }) {

  if (!items.length) {

    return (

      <div className="empty-state">

        <span>🔍</span>

        <h3>No items found yet</h3>

        <p>Items posted through the form will appear here.</p>

      </div>

    );

  }



  return (

    <div className="item-grid">

      {items.map((item) => (

        <article className="item-card" key={item.id}>

          <div className="item-card-top">

            <span

              className={`tag ${

                String(item.type).toUpperCase() === "FOUND"

                  ? "found"

                  : "lost"

              }`}

            >

              {item.type || "ITEM"}

            </span>

            <span className="item-category">{item.category}</span>

          </div>



          <h3>{item.title}</h3>

          <p className="item-description">

            {item.description || "No description provided."}

          </p>



          <div className="item-details">

            <p>📍 {item.location || "Location not provided"}</p>

            <p>📅 {item.date || "Date not provided"}</p>

            {item.contactName && <p>👤 {item.contactName}</p>}

            {item.contactEmail && <p>✉️ {item.contactEmail}</p>}

          </div>



          {user && (

            <button

              className="delete-button"

              onClick={() => onDelete(item.id)}

            >

              Delete item

            </button>

          )}

        </article>

      ))}

    </div>

  );

}
