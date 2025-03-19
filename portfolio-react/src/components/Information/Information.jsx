import React, { useEffect, useRef, useState } from 'react'
import './Information.css'

function Information() {

    const [show, setShow] = useState(false);
    const messageRef = useRef(null);
    const toggleRef = useRef(null);

    const handleClickOutside = (event) => {
        if (
            messageRef.current &&
            !messageRef.current.contains(event.target) &&
            (!toggleRef.current || !toggleRef.current.contains(event.target))
        ) {
            setShow(false);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside, true);
        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, []);



    return (
        <div>
            <span className="material-symbols-outlined" id="infoToggle" onClick={() => setShow(!show)} ref={toggleRef}>
                info
            </span>
            {show &&
                <div className="infoMessage" id="infoMessage" ref={messageRef}>
                    <p>
                        This web was designed on Figma and developed with HTML5, CSS3 and JavaScript.
                    </p>
                </div>
            }
        </div>
    )
}

export default Information