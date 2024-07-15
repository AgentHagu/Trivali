import GoogleMapSearchBar from "../components/GoogleMapSearchBar";

export default function Test() {
    const handlePlaceSelected = (place) => {
        console.log('Selected place:', place);
    };

    return (
        <div className="App">
            <h1>Google Maps Autocomplete Search</h1>
            <GoogleMapSearchBar onPlaceSelected={handlePlaceSelected} />
        </div>
    );
}