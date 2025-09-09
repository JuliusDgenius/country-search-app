const btn = document.getElementById("searchInfo");
const inputElem = document.getElementById("country");
const displayInfo = document.getElementById("displayInfo");
const loader = document.getElementById("loader");
const error = document.getElementById("error");

btn.addEventListener("click", async (e) => {
    const countryName = inputElem.value.trim();
    const API_URL = `https://restcountries.com/v3.1/name/${countryName}?fullText=true`;
    e.preventDefault();

    try {
      loader.classList.remove("loader");
      const response = await fetch(API_URL);
      const data = await response.json();
      const country = data[0];

      if (!country) {
        throw new Error("Invalid country name");
      }
      const languages = country.languages ? Object.values(country.languages).join(",") : "N/A";
      displayInfo.innerHTML = `
            <div class="p-4 border rounded shadow">
                <img src="${country.flags.svg}" alt="flag" class="w-32 mb-2" width=100px height=100px>
                <h2 class="text-xl font-bold"> ${country.name.common}</h2>
                <p><strong>Capital:</strong> ${country.capital}</p>
                <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
                <p><strong>Languages:</strong> ${languages}</p>
                <div class="mb-4">
                    <h2 class="text-xl font-semibold mb-2">Local Times</h2>
                    <ul id="timezoneList" class="list-disc ml-6"></ul>
                </div>
            </div>
        `;
      console.log("response:", data[0].name.official);  
    } catch (err) {
      console.error(`Failed to fetch information for ${countryName}.`, err);
      error.classList.remove("error");
      error.innerHTML = `${err.message}`;
    } finally {
        loader.classList.add("loader");
	document.getElementById("country-form").reset();
    }
});
