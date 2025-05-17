export async function getMenuDataStore(sheetId) {
  const proxyUrl = "https://get-update-menu.interactivemenuqr.workers.dev";
  const type = 'getMenu';
  try {
    let fullResponse = await fetch(`${proxyUrl}/${type}?${sheetId}`);
    let fullData = await fullResponse.json();
    const objectData = JSON.parse(fullData)
    const processedData = processData(objectData.values);
    return processedData;
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
    return [];
  }
}


function processData(data) {
  const keys = data[0];
  const objectsArray = data.slice(2).map(row => {
    let obj = {};
    row.forEach((value, index) => {
      obj[keys[index]] = value;
    });
    return obj;
  });
  return objectsArray;
}