"use client";
/* eslint-disable */
// @ts-nocheck
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const lerp = (a, b, n) => (1 - n) * a + n * b;

const getMousePos = (e, container) => {
  if (container) {
    const bounds = container.getBoundingClientRect();
    return {
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top
    };
  }
  return { x: e.clientX, y: e.clientY };
};

const Crosshair = ({ color = '#00f0ff', containerRef = null }) => {
  const cursorRef = useRef(null);
  const reticleRef = useRef(null);

  let mouse = { x: 0, y: 0 };

  useEffect(() => {
    const handleMouseMove = ev => {
      mouse = getMousePos(ev, containerRef?.current);
      if (containerRef?.current) {
        const bounds = containerRef.current.getBoundingClientRect();
        if (
          ev.clientX < bounds.left ||
          ev.clientX > bounds.right ||
          ev.clientY < bounds.top ||
          ev.clientY > bounds.bottom
        ) {
          gsap.to(reticleRef.current, { opacity: 0, scale: 0.5 });
        } else {
          gsap.to(reticleRef.current, { opacity: 1, scale: 1 });
        }
      }
    };

    const target = containerRef?.current || window;
    target.addEventListener('mousemove', handleMouseMove);

    const renderedStyles = {
      tx: { previous: window.innerWidth / 2, current: window.innerWidth / 2, amt: 0.15 },
      ty: { previous: window.innerHeight / 2, current: window.innerHeight / 2, amt: 0.15 }
    };

    gsap.set(reticleRef.current, { opacity: 0, scale: 0.5, xPercent: -50, yPercent: -50 });

    const onMouseMove = () => {
      renderedStyles.tx.previous = renderedStyles.tx.current = mouse.x;
      renderedStyles.ty.previous = renderedStyles.ty.current = mouse.y;

      gsap.to(reticleRef.current, {
        duration: 0.9,
        ease: 'Power3.easeOut',
        opacity: 1,
        scale: 1
      });

      requestAnimationFrame(render);
      target.removeEventListener('mousemove', onMouseMove);
    };

    target.addEventListener('mousemove', onMouseMove);

    const tl = gsap.timeline({ paused: true })
      .to(reticleRef.current, {
        scale: 1.5,
        rotate: 45,
        duration: 0.3,
        ease: "back.out(1.7)"
      });

    const enter = () => tl.play();
    const leave = () => tl.reverse();

    let rAF;
    const render = () => {
      renderedStyles.tx.current = mouse.x;
      renderedStyles.ty.current = mouse.y;

      for (const key in renderedStyles) {
        renderedStyles[key].previous = lerp(
          renderedStyles[key].previous,
          renderedStyles[key].current,
          renderedStyles[key].amt
        );
      }

      if (reticleRef.current) {
        gsap.set(reticleRef.current, {
          x: renderedStyles.tx.previous,
          y: renderedStyles.ty.previous
        });
      }

      rAF = requestAnimationFrame(render);
    };

    const links = containerRef?.current ? containerRef.current.querySelectorAll('a, button') : document.querySelectorAll('a, button');
    links.forEach(link => {
      link.addEventListener('mouseenter', enter);
      link.addEventListener('mouseleave', leave);
    });

    return () => {
      cancelAnimationFrame(rAF);
      target.removeEventListener('mousemove', handleMouseMove);
      target.removeEventListener('mousemove', onMouseMove);
      links.forEach(link => {
        link.removeEventListener('mouseenter', enter);
        link.removeEventListener('mouseleave', leave);
      });
    };
  }, [containerRef]);

  return (
    <div
      ref={cursorRef}
      className="cursor"
      style={{
        position: containerRef ? 'absolute' : 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10000
      }}
    >
      <div
        ref={reticleRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '40px',
          height: '40px',
          pointerEvents: 'none',
        }}
      >
        <div style={{
          position: 'absolute',
          inset: 0,
          border: `1px solid ${color}`,
          borderRadius: '50%',
          opacity: 0.5,
          boxShadow: `0 0 10px ${color}40`
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '-100vw',
          right: '-100vw',
          height: '1px',
          background: color,
          transform: 'translateY(-50%)',
          opacity: 0.5,
          boxShadow: `0 0 8px ${color}`
        }} />
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '-100vh',
          bottom: '-100vh',
          width: '1px',
          background: color,
          transform: 'translateX(-50%)',
          opacity: 0.5,
          boxShadow: `0 0 8px ${color}`
        }} />
        <div style={{
          position: 'absolute',
          inset: '16px',
          background: color,
          borderRadius: '50%',
          boxShadow: `0 0 15px ${color}`
        }} />
      </div>
    </div>
  );
};

export default Crosshair;
