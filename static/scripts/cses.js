let all_user_data = []

const id_list = [
    83810,
    138667,
    49521,
    157346
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
    const url = `user/${user_id}`;
    const response = await fetch(url);
    return response.json();
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

    return user_solved.slice(starting_index, ending_index+1)
                      .filter( problem => problem.solved_task);
}

const changeCategory = () => {
    const option = document.getElementById("categorias-dropdown").selectedOptions[0].value; 
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
