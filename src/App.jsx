import './App.css';
import logo from './assets/icones/FN.png';
import { FaDumbbell } from 'react-icons/fa';
import { IoIosHeartEmpty } from 'react-icons/io';
import { TbProgressCheck } from 'react-icons/tb';
import { useRef, useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login.jsx'

// Home com o conteúdo atual
function Home() {
  const featureRef = useRef([]);  
  const [isIntersecting, setIsIntersecting] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsIntersecting((prev) => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting,
          }));
        });
      },
      { threshold: 0.5 }
    );

    featureRef.current.forEach((el) => el && observer.observe(el));
    return () => featureRef.current.forEach((el) => el && observer.unobserve(el));
  }, []);

  const featureItems = [
    { id: 'feature-1', icon: <FaDumbbell size={50} color="#8ea598" />, title: 'Planos personalizados', description: 'Crie uma rotina de exercícios sob medida para suas necessidades.' },
    { id: 'feature-2', icon: <IoIosHeartEmpty size={50} color="#8ea598" />, title: 'Feedback em tempo real', description: 'Receba orientações instantâneas para corrigir seus movimentos.' },
    { id: 'feature-3', icon: <TbProgressCheck size={50} color="#8ea598" />, title: 'Acompanhamento de progresso', description: 'Monitore sua evolução e ajuste seu plano conforme necessário.' },
  ];

  return (
    <section className="hero-section">
      <h1><span className="highlight">Fisioterapia</span> Guiada por IA</h1>
      <p>Exercícios personalizados e feedback em tempo real para sua recuperação, no conforto da sua casa</p>
        <div className="botoes-container">
          <Link to="/login" className="cta-button">Faça Login ou Cadastre-se!</Link>
          <Link to="/teste" className="cta-button outline">Testar agora</Link>
        </div>

      <section className="feature-section">
        <h2> O que nossa IA pode fazer por você</h2>
        <div className="feature-container">
          {featureItems.map((item, index) => (
            <div 
              key={item.id}
              id={item.id}
              ref={(el) => (featureRef.current[index] = el)}
              className={`feature-item ${isIntersecting[item.id] ? 'animate' : ''}`}
            >
              {item.icon}
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

function App() {
  return (
    <div>
      <header>
        <img src={logo} alt="Logo Fisiotech" className="logo" />
        <nav>
          <ul>
            <li><a href="#">Funcionalidades</a></li>
            <li><a href="#">Contato</a></li>
            <li><a href="#">Serviços</a></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </nav>
      </header>

      <main>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
