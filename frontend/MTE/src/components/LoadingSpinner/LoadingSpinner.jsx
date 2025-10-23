import React from "react";

const LoadingSpinner = ({size ='medium', text = 'Loading...'}) => {
    const sizeStyles = {
        small: {width: '30px', height: '30px'},
        medium: {width: '50px', height: '50px'},
        large: {width: '80px', height: '80px'},
    };
    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
    };
    const spinnerStyle = {
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        ...sizeStyles[size],
    };
    const textStyle = {
        marginTop: '1rem',
        color: '#666',
        fontSize: '0.9rem',
    };
    return (
        <div style={containerStyle}>
            <style>
                {`@keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }`
            }
            </style>
            <div style={spinnerStyle}></div>
            {text && <div style={textStyle}>{text}</div>
                }
        </div>
    );
};
export default LoadingSpinner;