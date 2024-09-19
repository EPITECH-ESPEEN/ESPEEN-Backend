import { useState } from 'react';

function HomePage() {
    const [name, setName] = useState('');
    const [responseMessage, setResponseMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch(`http://127.0.0.1:3000/hello/${name}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                const data = await response.text();
                setResponseMessage(data);  // Mise à jour de la réponse
            } else {
                setResponseMessage('Something went wrong!');
            }
        } catch (error) {
            console.error('Request failed:', error);
            setResponseMessage('Failed to fetch data');
        }
    };

    return (
        <div>
            <h1>Welcome to the Home Page!</h1>
            <p>You have successfully logged in.</p>

            {/* Formulaire pour entrer le nom de l'utilisateur */}
            <form onSubmit={handleSubmit}>
                <label>
                    Enter your name:
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </label>
                <button type="submit">Submit</button>
            </form>

            {/* Affichage de la réponse du backend */}
            {responseMessage && <p>{responseMessage}</p>}
        </div>
    );
}

export default HomePage;
