//globals
let page = 1;

//objects
let cacheObject = {
    data:{},
    addData: function (pageNo, items) {
        cacheObject.data[pageNo.toString()] = [...items];
    },
    removeData: function (pageNo) {
        delete cacheObject.data[pageNo];
        return !cacheObject.checkData(pageNo);
    },
    getData: function(pageNo){
        let result = cacheObject.data[pageNo.toString()];
        return result;
    },
    checkData: function(pageNo){
        return cacheObject.data.hasOwnProperty(pageNo)
    },
    getAllData : function(){
        let result = [];
        let tmp_obj_values = Object.values(cacheObject.data);
        for (let i = 0; i < tmp_obj_values.length; i++) {
            const items = tmp_obj_values[i];
            result.push(...items);
        }
        let tmp_set = new Set (result)
        return Array.from(tmp_set);
    }

};

let data = {

    getData: function (page = 1, cb) {
        //check cachedata
        if(cacheObject.checkData(page)){
            console.log("cache hit");
            cb(cacheObject.getData(page));
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function() {
            if(this.readyState === 4) {
                console.log("api hit");
                let tmp_obj = JSON.parse(this.responseText);
                cacheObject.addData(page, tmp_obj.results);
                cb(tmp_obj.results);
            }
        });

        xhr.open("GET", `http://localhost:5500/data${page}.json`);
        xhr.send();
    },
    getDataAsync : function(page=1){
        return new Promise((resolve, reject )=> {
            try {
                data.getData(page, function(result){
                    resolve(result);
                });
            } catch (error) {
                console.log('error', error);
                reject(error);
            }
        });
    },
    filterData: function (text) {
        let all_data = cacheObject.getAllData();
        let result_arr = all_data.filter((item)=>item.name.toLowerCase().includes(text.toLowerCase()));
        return result_arr;
    }

};

let container = {
    filterContainer : function(text){
        let my_tmp_arr = data.filterData(text);
        fillContainerWithData(my_tmp_arr);
    },
    fillContainerWithData: function(dataArray){
        let my_container = document.getElementsByClassName('container')[0]
        let container_html = '';
        for (let i = 0; i < dataArray.length; i++) {
            const characterData = dataArray[i];
            container_html += container.makeDivForCharacterCard(characterData);
        }
        my_container.innerHTML = container_html;
    },
    makeDivForCharacterCard: function(characterData){
        let character_card_template = `<div class="character-card">
            <img src="${characterData.image}" />
            <h2>${characterData.name}(${characterData.gender})</h2>
        </div>`;
    
        return character_card_template;
    },
    generateMylist: async function(page=1){
        let result = await data.getDataAsync(page);
        //let currentData = JSON.parse(result);
        container.fillContainerWithData(result);
        // data.getData(page, function(result){
        //     let currentData = JSON.parse(result);
        //     fillContainerWithData(currentData);
        // });
    }
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

function search(){
    let searchText = document.getElementById('searchText');
    console.log(searchText.value);
    let searchedText = searchText.value;
    let tmp_arr = data.filterData(searchedText);
    container.fillContainerWithData(tmp_arr);
}



//document events
document.addEventListener('DOMContentLoaded',async function () {
    await container.generateMylist();
});