function addUserMessage(message) {
    $('#chat-box').append(`<div class="message user-message">${message}</div>`);
    $('#chat-box').scrollTop($('#chat-box')[0].scrollHeight);
}

function addBotMessage(message) {
    $('#chat-box').append(`<div class="message bot-message">${message}</div>`);
    $('#chat-box').scrollTop($('#chat-box')[0].scrollHeight);
}

function showOptions(options) {
    const optionsContainer = $('#options-container');
    optionsContainer.empty();
    options.forEach(option => {
        optionsContainer.append(`<button class="btn btn-outline-primary option-button">${option}</button>`);
    });

    $('.option-button').click(function() {
        const userOption = $(this).text();
        addUserMessage(userOption);
        $.post('/chat', { option: userOption }, function(data) {
            addBotMessage(data.message);
            showOptions(data.options);
        });
    });
}

$(document).ready(function() {
    $.post('/chat', { option: 'inicio' }, function(data) {
        addBotMessage(data.message);
        showOptions(data.options);
    });
});