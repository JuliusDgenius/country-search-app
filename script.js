const btn = document.getElementById("searchInfo");
const inputElem = document.getElementById("country");
const displayInfo = document.getElementById("displayInfo");
const loader = document.getElementById("loader");
const error = document.getElementById("error");
let map;

btn.addEventListener("click", async (e) => {
    const countryName = inputElem.value.trim();
    const API_URL = `https://restcountries.com/v3.1/name/${countryName}?fullText=true`;
    e.preventDefault();
    error.innerHTML = "";
    displayInfo.innerHTML = "";

    try {
      loader.classList.remove("loader");
      const response = await fetch(API_URL);
      const data = await response.json();
      const country = data[0];

      if (!country) {
        throw new Error("Invalid country name");
      }
      const languages = country.languages ? Object.values(country.languages).join(",") : "N/A";
      const currency = country.currencies ? Object.values(country.currencies)[0] : { name: "N/A", symbol: "" };

      displayInfo.innerHTML = `
            <div class="p-4 border rounded shadow">
                <img src="${country.flags.svg}" alt="flag" class="w-32 mb-2" width=100px height=100px>
                <h2 class="text-xl font-bold"> ${country.name.common}</h2>
                <p><strong>Capital:</strong> ${country.capital}</p>
                <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
                <p><strong>Languages:</strong> ${languages}</p>
                <p><strong>Currency:</strong> ${currency.name} (${currency.symbol})</p>
                <p><strong>Region/Continent:</strong> ${country.region}</p>
                <p><strong>Area:</strong> ${country.area.toLocaleString()} km²</p>
                <div class="mb-4">
                    <h2 class="text-xl font-semibold mb-2">Local Times</h2>
                    <ul id="timezoneList" class="list-disc ml-6"></ul>
                </div>
            </div>
        `;
      
        updateTimezones(country.timezones);
        drawMap(country.latlng, country.name.common);
    } catch (err) {
      console.error(`Failed to fetch information for ${countryName}.`, err);
      error.classList.remove("error");
      error.innerHTML = `${err.message}`;
    } finally {
        loader.classList.add("loader");
	document.getElementById("country-form").reset();
    }
});
const updateTimezones = (timezones) => {
  const timezoneList = document.getElementById("timezoneList");
  timezoneList.innerHTML = "";

  timezones.forEach((tz) => {
      const li = document.createElement("li");
      
      const localTime = getTimeUsingIntl(tz);

      li.innerHTML = `${tz} - ${localTime}`;
      timezoneList.appendChild(li);
  });
}

const getTimeUsingIntl = (tz) => {
  try {
      const options = {
          timeZone: convertToIANA(tz),
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
      }

      return new Intl.DateTimeFormat("en-US", options).format(new Date());
  } catch (error) {
      console.warn(`Timezone ${tz} not supported, falling back.`);
      return "Unsupported timezone";
  }
}

const convertToIANA = (utcString) => {
  // Basic support for known UTC format
  if (utcString === "UTC") return "Etc/UTC";

  const match = utcString.match(/^UTC([+-]\d{1,2}):(\d{2})$/);
  if (match) {
      const [, sign, hour, min] = match;
      const oppositeSign = sign === '+' ? '-' : '+';

      if (min === "00") {
        return `Etc/GMT${oppositeSign}${parseInt(hour, 10)}`;
    }
  }

  // Fallback for formats that can't be accurately converted, including those with minutes
  return "Etc/UTC"; // fallback
}

const drawMap = (latlang, name) => {
  const [lat, lng] = latlang;

  if (!map ){
      map = L.map("map").setView([lat, lng], 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);   
  } else {
      map.setView([lat, lng], 5);
  }
  L.marker([lat, lng]).addTo(map).bindPopup(name).openPopup();
}
