    import { useState, useEffect, useRef } from "react";
    import "./Carousel.css";

    // Reemplazá esto con tus propios items (imagen + título, etc.)
    const DEFAULT_ITEMS = [
    { id: 1, title: "Item 1", img: "https://picsum.photos/seed/1/300/200" },
    { id: 2, title: "Item 2", img: "https://picsum.photos/seed/2/300/200" },
    { id: 3, title: "Item 3", img: "https://picsum.photos/seed/3/300/200" },
    { id: 4, title: "Item 4", img: "https://picsum.photos/seed/4/300/200" },
    { id: 5, title: "Item 5", img: "https://picsum.photos/seed/5/300/200" },
    ];

    function Carousel({ items = DEFAULT_ITEMS, autoRotate = true, intervalMs = 3000, radius = 320 }) {
    const [index, setIndex] = useState(0);
    const timerRef = useRef(null);

    const total = items.length;
    const angleStep = 360 / total;

    const next = () => setIndex((i) => (i + 1) % total);
    const prev = () => setIndex((i) => (i - 1 + total) % total);

    // Rotación automática
    const startAutoRotate = () => {
        stopAutoRotate();
        if (autoRotate) {
        timerRef.current = setInterval(next, intervalMs);
        }
    };
    const stopAutoRotate = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    useEffect(() => {
        startAutoRotate();
        return stopAutoRotate;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoRotate, intervalMs, total]);

    // Al usar una flecha, reiniciamos el timer para que no "salte" justo después del click
    const handleNext = () => {
        next();
        startAutoRotate();
    };
    const handlePrev = () => {
        prev();
        startAutoRotate();
    };

    return (
        <div
        className="carousel-3d-wrapper"
        onMouseEnter={stopAutoRotate}
        onMouseLeave={startAutoRotate}
        >
        <button className="carousel-arrow left" onClick={handlePrev} aria-label="Anterior">
            ‹
        </button>

        <div className="carousel-3d-scene">
            <div
            className="carousel-3d-ring"
            style={{
                transform: `translateZ(-${radius}px) rotateY(${-index * angleStep}deg)`,
            }}
            >
            {items.map((item, i) => (
                <div
                key={item.id}
                className={`carousel-3d-item ${i === index ? "is-active" : ""}`}
                style={{
                    transform: `rotateY(${i * angleStep}deg) translateZ(${radius}px)`,
                }}
                >
                <img src={item.img} alt={item.title} />
                <p>{item.title}</p>
                </div>
            ))}
            </div>
        </div>

        <button className="carousel-arrow right" onClick={handleNext} aria-label="Siguiente">
            ›
        </button>
        </div>
    );
    }

    export default Carousel;