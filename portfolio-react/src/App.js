import './App.css';
import Information from './components/Information/Information';
import Navbar from './components/Navbar/Navbar';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';

function App() {
  return (
    <div className="App">
      <ScrollToTop />
      <Information />
      <Navbar />
    </div>
  );
}

export default App;
