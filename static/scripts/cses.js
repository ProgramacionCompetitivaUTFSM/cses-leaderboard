const IP = `http://bogodijkstra.xyz:5001`
let all_user_data = []

const id_list = [
    102879,
    144352,
    143392,
    138829,
    138667,
    144349,
    143605,
    145408,
    144447,
    144354,
    144353,
    49521,
    135064
];


// All html components
const rowComponent = (username, solved) => {
    return `
    <tr>
        <td class="text-white py-3 px-6">${username}</td>
        <td class="text-white py-3 px-6">${solved}</td>
    <tr>
    `
}

const barComponent = (username, total, percentage) => {
    return `
    <div class="w-full my-5 col-span-11 rounded-full h-2.5">
        <p class="text-white">${username}</p>
        <div class="
            bg-blue-600
            text-xs
            font-medium
            text-blue-100 
            text-right
            leading-none
            rounded-full"
            style="width: ${String(percentage)}%"
        > <p class="mr-3 text-base">${String(total)}</p> </div>
    </div>
    `
}

const getSolved = async (user_id) => {
    const url = `${IP}/proxyapi/${user_id}`;

    // get html from user
    const response = await fetch(url);
    const plain_html = await response.text();

    // parse it
    const parser = new DOMParser();
    const doc = parser.parseFromString(plain_html, "text/html");

    // scrapping
    const all_solved_dom = doc.getElementsByClassName("task-score icon");
    const username = doc.getElementsByClassName("content")[0].childNodes[2].textContent.trim().slice(15);
    const solved_count = doc.getElementsByClassName("content")[0].childNodes[4].textContent.trim().slice(14).split("/")[0]
    // return all exercises in order
    let all_solved = [];
    for (let exercise of all_solved_dom) {
        all_solved.push({
            problem_name: exercise.getAttribute("title"),
            solved_task: exercise.classList.contains("full")
        });
    }

    return {
        username,
        solved_count,
        all_solved
    };
};

const exercises_ranges = {
    "introductory": ["Weird Algorithm", "Grid Paths"],
    "sorting": ["Distinct Numbers", "Maximum Subarray Sum II"],
    "dynamic": ["Dice Combinations", "Counting Numbers"],
    "graph": ["Counting Rooms", "Distinct Routes"],
    "range": ["Static Range Sum Queries", "Range Queries and Copies"],
    "tree": ["Subordinates", "Fixed-Length Paths II"],
    "mathematics": ["Josephus Queries", "Another Game"],
    "string": ["Word Combinations", "Substring Distribution"],
    "geometry": ["Point Location Test", "Convex Hull"],
    "advanced": ["Meet in the Middle", "Distinct Routes II"],
    "additional": ["Shortest Subsequence", "Grid Path Construction"]
};

const getRangeIndexByCategory = (category) => {

    const [starting, ending] = exercises_ranges[category]
    const exercises = all_user_data.at(0).all_solved;
    
    //getting start
    let starting_index = -1;
    exercises.find( (obj, i) => {
        if (obj.problem_name == starting) {
            starting_index = i;
            return true;
        }
    });

    // getting end
    let ending_index = -1;
    exercises.find( (obj, i) => {
        if (obj.problem_name == ending && i > starting_index) {
            ending_index = i;
            return true;
        }
    });

    return [starting_index, ending_index];
}

const getCategorySolvedByUsername = (username, category) => {
    
    let user_solved = all_user_data.find( (obj) => obj.username == username);
    user_solved = user_solved.all_solved;

    const [starting_index, ending_index] = getRangeIndexByCategory(category);

    return user_solved.slice(starting_index, ending_index)
                      .filter( problem => problem.solved_task);
}

const changeCategory = (option) => {
    document.getElementById("solvedcategory-insert").innerHTML = "";
    loadBarCategoryHTML(option);
}

const loadBarCategoryHTML = (category) => {
    const [starting_index, ending_index] = getRangeIndexByCategory(category);
    const problems_count = ending_index-starting_index + 1;

    for (const user of all_user_data) {
        const user_solved_category = getCategorySolvedByUsername(user.username, category);
        const percentage = parseInt( (user_solved_category.length/problems_count) * 100);
        document.getElementById("solvedcategory-insert")
            .innerHTML += barComponent(user.username, `${user_solved_category.length}/${problems_count}`, percentage);
    }
}

//console.log(all_user_data)
Promise.all(
    id_list.map( async (user_id) => {
        const user_data = await getSolved(user_id);
        all_user_data.push(user_data);
    })
).then( () => {

    all_user_data.sort( (a, b)  => {
        return b.solved_count - a.solved_count;
    })

    loadBarCategoryHTML("introductory")
    for (const user of all_user_data)
        document.getElementById("solved-insert")
            .innerHTML += rowComponent(user.username, user.solved_count);
});
