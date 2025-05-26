import React, { useRef } from 'react';
import Slider from 'react-slick';
import './Home.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Carousel and Event Data
const featuredEvents = [
  {
    id: 1,
    title: 'Rock Fest 2025',
    img: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg',
  },
  {
    id: 2,
    title: 'Jazz Night',
    img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1350&q=80',
  },
  {
    id: 3,
    title: 'Karaoke Night',
    img: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1350&q=80',
  },
];

const hotEvents = [
  { id: 4, title: 'Hot Concert 1', date: '2025-06-15' },
  { id: 5, title: 'Hot Concert 2', date: '2025-06-20' },
  { id: 6, title: 'Hot Concert 3', date: '2025-07-01' },
];

const upcomingEvents = [
  { id: 7, title: 'Upcoming Event 1', date: '2025-08-10' },
  { id: 8, title: 'Upcoming Event 2', date: '2025-09-05' },
  { id: 9, title: 'Upcoming Event 3', date: '2025-10-12' },
];

export default function Home() {
  const sliderRef = useRef();

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false, // We'll handle arrows manually
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          slidesToShow: 1
        }
      }
    ]
  };

  return (
    <div className="home-container">
      {/* Manual Carousel Arrows */}
      <div className="top-arrows">
        <button
          className="top-arrow left"
          onClick={() => sliderRef.current.slickPrev()}
          aria-label="Previous slide"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <button
          className="top-arrow right"
          onClick={() => sliderRef.current.slickNext()}
          aria-label="Next slide"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      {/* Carousel Section */}
      <section className="carousel-section">
        <Slider ref={sliderRef} {...settings}>
          {featuredEvents.map(event => (
            <div key={event.id} className="carousel-slide">
              <div className="carousel-content">
                <img src={event.img} alt={event.title} className="carousel-img" />
                <div className="carousel-text">
                  <h3>{event.title}</h3>
                  <button className="glow-btn">Book Now</button>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* Hot Events */}
      <section className="hot-events">
        <h2 className="section-title">🔥 Hot Events</h2>
        <div className="events-grid">
          {hotEvents.map(event => (
            <div key={event.id} className="event-card">
              <h4>{event.title}</h4>
              <p>Date: {event.date}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="upcoming-events">
        <h2 className="section-title">📅 Upcoming Events</h2>
        <div className="events-grid">
          {upcomingEvents.map(event => (
            <div key={event.id} className="event-card">
              <h4>{event.title}</h4>
              <p>Date: {event.date}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <BenefitsSection />
    </div>
  );
}

// Login/Signup Benefits Section
function BenefitsSection() {
  return (
    <div className="benefits-container">
      <h2>Login or Signup to gain additional benefits</h2>
      <p>
        Get your own personal profile, follow artists you love, and more when you sign up for a Golden Ticket account.
      </p>
      <div className="benefits-buttons">
        <a href="/login" className="benefit-btn">Login</a>
        <a href="/register" className="benefit-btn">Sign Up</a>
      </div>
    </div>
  );
}
