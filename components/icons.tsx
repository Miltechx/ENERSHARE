export const Icons = {
  Lightning: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  
  Solar: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M12 2V4M12 20V22M4 12H2M6 6L4 4M18 18L20 20M20 12H22M18 6L20 4M6 18L4 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  
  Generator: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M8 6V8M16 6V8M12 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="14" r="2" fill="currentColor"/>
      <path d="M9 14H7M15 14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  
  Grid: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 6H21M3 12H21M3 18H21M6 3V21M12 3V21M18 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
    </svg>
  ),
  
  Battery: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="7" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M18 12H20V16H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <rect x="7" y="10" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.3"/>
      <rect x="7" y="10" width="4" height="8" rx="1" fill="currentColor"/>
    </svg>
  ),
  
  Wallet: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 8V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V8M3 8V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V8M3 8H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="17" cy="14" r="2" fill="currentColor"/>
    </svg>
  ),
  
  Trade: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 8L21 12M21 12L17 16M21 12H3M7 16L3 12M3 12L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  
  Chart: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 20H20M6 16L8 9M12 16L14 4M18 16L16 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  
  Carbon: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9C5 12.87 12 21 12 21C12 21 19 12.87 19 9C19 5.13 15.87 2 12 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M12 2V4M12 20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  
  User: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M5 20V19C5 15.6863 7.68629 13 11 13H13C16.3137 13 19 15.6863 19 19V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  
  Settings: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M19.4 15.05L18.3 15.95C18.1 16.1 18 16.35 18.05 16.6L18.2 17.85C18.25 18.15 18.05 18.45 17.75 18.5L16.55 18.75C16.3 18.8 16.1 18.95 16 19.15L15.35 20.3C15.15 20.65 14.8 20.85 14.4 20.85H13.2C12.8 20.85 12.45 20.65 12.25 20.3L11.6 19.15C11.5 18.95 11.3 18.8 11.05 18.75L9.85 18.5C9.55 18.45 9.35 18.15 9.4 17.85L9.55 16.6C9.6 16.35 9.5 16.1 9.3 15.95L8.2 15.05C7.95 14.85 7.9 14.5 8.05 14.2L8.7 13.05C8.85 12.8 8.85 12.5 8.7 12.25L8.05 11.1C7.9 10.8 7.95 10.45 8.2 10.25L9.3 9.35C9.5 9.2 9.6 8.95 9.55 8.7L9.4 7.45C9.35 7.15 9.55 6.85 9.85 6.8L11.05 6.55C11.3 6.5 11.5 6.35 11.6 6.15L12.25 5C12.45 4.65 12.8 4.45 13.2 4.45H14.4C14.8 4.45 15.15 4.65 15.35 5L16 6.15C16.1 6.35 16.3 6.5 16.55 6.55L17.75 6.8C18.05 6.85 18.25 7.15 18.2 7.45L18.05 8.7C18 8.95 18.1 9.2 18.3 9.35L19.4 10.25C19.65 10.45 19.7 10.8 19.55 11.1L18.9 12.25C18.75 12.5 18.75 12.8 18.9 13.05L19.55 14.2C19.7 14.5 19.65 14.85 19.4 15.05Z" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  ),
  
  Check: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  
  Close: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  
  Menu: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  
  ArrowRight: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
}
