const defaultTitle = "Welcome to GMDB";
const defaultDescription = "An app made for gamers by a gamer";
const defaultKeywords = "game, track games, rate games, provide reviews, game reviews, games info";


const Meta = ({ title = defaultTitle, description = defaultDescription, keywords = defaultKeywords }) => {
    return (
        <>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
        </>
    );
};

export default Meta;