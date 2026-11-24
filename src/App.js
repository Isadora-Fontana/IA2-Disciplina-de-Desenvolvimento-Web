import './App.css';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import NavBar from './compenents/navbar';
import Produto from './pages/produtos';
import Home from './pages/home';

function App() {
  return (
    <div className="App">
      <Router>
        <NavBar />
          <Routes>
            <Route exact path="/" element={<Home />}/>
            <Route exact path="/home" element={<Home />}/>
            <Route exact path="/produtos" element={<Produto />} />     
          </Routes>     
      </Router>
    </div>
  );
}

export default App;
