import { useState, useEffect } from "react";

function VenueDetails({ venueId }) {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (venueId) {
      fetch(`/api/venues/fields?venueId=${venueId}`)  // Menggunakan query parameter venueId
        .then((res) => res.json())
        .then((data) => {
          setFields(data); // Menyimpan lapangan-lapangan yang diterima
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching fields:", error);
          setLoading(false);
        });
    }
  }, [venueId]);

  return (
    <div>
      <h2>Lapangan di Venue</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {fields.map((field) => (
            <li key={field.id}>{field.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default VenueDetails;