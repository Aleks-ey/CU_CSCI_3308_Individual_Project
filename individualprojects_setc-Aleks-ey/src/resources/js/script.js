function saveR(){
    if(document.getElementById('review-text').value == '') {

    }
    else {
        let artist = document.getElementById('artist-name').value;
        let reviews = document.getElementById('review-text').value;

        console.log(artist);
        console.log(reviews);

        $.ajax({
            url: '/saveReview',
            type: 'POST',
            cache: false,
            data: {artist: artist,
                reviews: reviews
            }
        });

        location.href='/review';
    }
}