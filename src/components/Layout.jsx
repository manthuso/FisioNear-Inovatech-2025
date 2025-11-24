import React from 'react'
import { Link } from 'react-router-dom'
import Footer from './Footer'
import logo from '../assets/icones/FN.png' // Assuming this path based on previous context

export default function Layout({ children }) {
  return (
    <div className="layout-container">
      <header>
        <Link to="/">
            <img src={logo} alt="FisioNear Logo" className="logo" />
        </Link>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/teste">Exercícios</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </nav>
      </header>
      <main>{children}</main>
      <Footer />
    </div>
  )
}
