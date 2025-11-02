import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

// Minimal LazyImage: uses IntersectionObserver to set src when visible.
// Falls back to native loading="lazy" when IO isn't available.
export default function LazyImage({ src, alt = '', className = '', style, placeholder, ...rest }) {
  const imgRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [loadedSrc, setLoadedSrc] = useState(null);

  useEffect(() => {
    if (!src) return;

    // If browser supports native lazy loading, we can set loading attribute and skip IO
    const supportsNativeLazy = 'loading' in HTMLImageElement.prototype;
    if (supportsNativeLazy) {
      setLoadedSrc(src);
      setVisible(true);
      return;
    }

    let observer;
    if (imgRef.current && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      }, { threshold: 0.1 });

      observer.observe(imgRef.current);
    } else {
      // No IO support — just show immediately
      setVisible(true);
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [src]);

  useEffect(() => {
    if (visible) {
      setLoadedSrc(src);
    }
  }, [visible, src]);

  return (
    <img
      ref={imgRef}
      src={loadedSrc || placeholder || ''}
      data-src={src}
      alt={alt}
      className={className}
      style={style}
      loading={loadedSrc ? 'lazy' : undefined}
      {...rest}
    />
  );
}

LazyImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  placeholder: PropTypes.string,
};
