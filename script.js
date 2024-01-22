//globals
let page = 1;
let z_counter = 0;
//objects
let cacheObject = {
  data: {},
  addData: function (pageNo, items) {
    cacheObject.data[pageNo.toString()] = [...items];
  },
  removeData: function (pageNo) {
    delete cacheObject.data[pageNo];
    return !cacheObject.checkData(pageNo);
  },
  getData: function (pageNo) {
    let result = cacheObject.data[pageNo.toString()];
    return result;
  },
  checkData: function (pageNo) {
    return cacheObject.data.hasOwnProperty(pageNo);
  },
  getAllData: function () {
    let result = [];
    let tmp_obj_values = Object.values(cacheObject.data);
    for (let i = 0; i < tmp_obj_values.length; i++) {
      const items = tmp_obj_values[i];
      result.push(...items);
    }
    let tmp_set = new Set(result);
    return Array.from(tmp_set);
  },
};

let data = {
  getDataAsync: async function (page = 1) {
    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };
    try {
      let var1 = await fetch(
        "http://gbpanalyzer.com/RickAndMorty/list?page=" + page,
        requestOptions
      ).then((response) => response.text());

      let dataJson = JSON.parse(var1);
      let data_arr = dataJson.data;

      cacheObject.addData(page, data_arr);

      return data_arr;
    } catch (error) {
      console.log("api error:", error);
    }
  },
  filterData: function (text) {
    let all_data = cacheObject.getAllData();
    let result_arr = all_data.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );
    return result_arr;
  },
};

let container = {
  filterContainer: function (text) {
    let my_tmp_arr = data.filterData(text);
    fillContainerWithData(my_tmp_arr);
  },
  fillContainerWithData: function (dataArray) {
    let my_container = document.getElementsByClassName("container")[0];
    let container_html = "";
    for (let i = 0; i < dataArray.length; i++) {
      const characterData = dataArray[i];
      container_html += container.makeDivForCharacterCard(characterData);
    }
    my_container.innerHTML = container_html;
  },
  makeDivForCharacterCard: function (characterData) {
    let character_card_template = `<div class="character-card">
            <img class="zoom" style="z-index:${z_counter}" src="${
      characterData.image
    }"/>
            <h2 style="z-index:${z_counter++}">${characterData.name}(${
      characterData.gender
    })</h2>
        </div>`;
    z_counter++;
    return character_card_template;
  },
  generateMylist: async function (page = 1) {
    let result = await data.getDataAsync(page);
    //let currentData = JSON.parse(result);
    z_counter = 0;
    container.fillContainerWithData(result);
    // data.getData(page, function(result){
    //     let currentData = JSON.parse(result);
    //     fillContainerWithData(currentData);
    // });
  },
};

async function next() {
  page++;
  await container.generateMylist(page);
  document.getElementById("current_page").innerText = page;
}

async function prev() {
  page--;
  await container.generateMylist(page);
  document.getElementById("current_page").innerText = page;
}

function search() {
  let searchText = document.getElementById("searchText");
  console.log(searchText.value);
  let searchedText = searchText.value;
  let tmp_arr = data.filterData(searchedText);
  container.fillContainerWithData(tmp_arr);
}

//document events
document.addEventListener("DOMContentLoaded", async function () {
  await container.generateMylist();
});

document.addEventListener("keydown", (e) => {
  e = e || window.event;
  if (e.keyCode === 37) {
    prev();
  } else if (e.keyCode === 39) {
    next();
  }
});
