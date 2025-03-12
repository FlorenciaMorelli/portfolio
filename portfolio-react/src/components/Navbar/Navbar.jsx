import React from 'react'
import './Navbar.css'

function Navbar() {
    return (
        <nav>
            <a href="/">
                <div className="iconImage">
                </div>
            </a>
            <ol>
                <li><a href="#about">About</a></li>
                <li><a href="#projects">Projects</a></li>
                <li><a href="#contact">Contact</a></li>
                <li className="resume"><a href="assets/documents/resume.pdf" download="FlorenciaMorelli">Resume</a></li>
            </ol>
        </nav>
    )
}

export default Navbar