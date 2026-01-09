import { useState, useRef, MouseEvent } from 'react';
import styles from './MagnifierImage.module.css';

interface MagnifierImageProps {
    src: string;
    alt: string;
}

export default function MagnifierImage({ src, alt }: MagnifierImageProps) {
    const [showMagnifier, setShowMagnifier] = useState(false);
    const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
    const [backgroundPosition, setBackgroundPosition] = useState({ x: 0, y: 0 });
    const imgRef = useRef<HTMLImageElement>(null);
    const zoomLevel = 1.5; // Subtle zoom as requested (less than 3x)
    const magnifierSize = 150; // Size of the lens

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!imgRef.current) return;

        const { top, left, width, height } = imgRef.current.getBoundingClientRect();

        // Calculate cursor position relative to the image
        let x = e.clientX - left;
        let y = e.clientY - top;

        // Prevent magnifier from going outside
        if (x < 0 || y < 0 || x > width || y > height) {
            setShowMagnifier(false);
            return;
        }

        setShowMagnifier(true);
        setMagnifierPosition({ x: x - magnifierSize / 2, y: y - magnifierSize / 2 });

        // Calculate background position for the zoomed image
        const bgX = (x * zoomLevel) - (magnifierSize / 2);
        const bgY = (y * zoomLevel) - (magnifierSize / 2);

        setBackgroundPosition({ x: -bgX, y: -bgY });
    };

    return (
        <div
            className={styles.container}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setShowMagnifier(false)}
        >
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                className={styles.image}
            />
            {showMagnifier && (
                <div
                    className={styles.magnifier}
                    style={{
                        width: `${magnifierSize}px`,
                        height: `${magnifierSize}px`,
                        top: `${magnifierPosition.y}px`,
                        left: `${magnifierPosition.x}px`,
                        backgroundImage: `url('${src}')`,
                        backgroundSize: `${imgRef.current?.width ? imgRef.current.width * zoomLevel : 0}px ${imgRef.current?.height ? imgRef.current.height * zoomLevel : 0}px`,
                        backgroundPosition: `${backgroundPosition.x}px ${backgroundPosition.y}px`
                    }}
                />
            )}
        </div>
    );
}
