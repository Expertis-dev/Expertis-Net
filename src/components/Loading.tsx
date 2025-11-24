import React from 'react'
export const Loading = ({ size = 90, text = "Cargando..." }) => {
    const colors = ["#000000", "#E96421", "#2BAD9D", "#40A1B6", "#2F576D", "#2DA9A4"];
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-50">
            <div
                className="animate-spin rounded-full border-t-4 border-b-4"
                style={{
                    width: size,
                    height: size,
                    borderColor: `${colors[1]} transparent ${colors[3]}`,
                }}
            ></div>
            {text && <p className="mt-4 text-gray-800 dark:text-white font-medium">{text}</p>}
        </div>
    );
}