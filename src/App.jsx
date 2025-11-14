import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavbarTop from "./components/NavbarTop";
import PostList from "./pages/PostsList";
import PostDetail from "./pages/PostDetail";
import PostForm from "./pages/PostForm";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Stats from "./pages/Stats";
import Categories from "./pages/Categories";
import Users from "./pages/Users";
import Profile from "./pages/Profile";


function App() {
  return (
    <>
      <NavbarTop />
      <Routes>
        <Route path="/" element={<PostList />} />
        <Route path="/posts" element={<PostList />} />
        <Route path="/posts/new" element={<PostForm />} />
        <Route path="/posts/:postId" element={<PostDetail />} />
        <Route path="/posts/:postId/edit" element={<PostForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/users" element={<Users />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}

export default App;