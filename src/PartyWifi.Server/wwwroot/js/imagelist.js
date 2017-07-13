function ImageViewModel(image) {
    var self = this;
    var model = image;

    self.identifier = model.identifier;
    self.isDeleted = ko.observable(model.isDeleted);
    self.uploadDate = new Date(Date.parse(model.uploadDate));
}

function ImageListViewModel() {
    var self = this;

    self.availablePageSizes = [5, 10, 20, 40, 100];

    self.maxPerPage = ko.observable(5);
    self.currentPage = ko.observable(1);
    self.totalPages = ko.observable(1);

    self.images = ko.observableArray();

    var load = function (offset) {
        $.ajax({
                url: '/api/images?limit=' + self.maxPerPage() + '&offset=' + offset,
                type: 'GET'
            })
            .done(function(data) {
                self.totalPages(Math.ceil(data.total / self.maxPerPage()));

                ko.utils.arrayForEach(data.images,
                    function(image) {
                        self.images.push(new ImageViewModel(image));
                    });
            });
    }

    // changes the page to the given next one
    var changePage = function (next) {
        self.images([]);
        self.currentPage(next);
        load((next * self.maxPerPage()) - self.maxPerPage());
    };

    // subscribe to combo box change of max images per page
    self.maxPerPage.subscribe(function () {
        self.currentPage(1);
        self.totalPages(1);
        self.images([]);
        load(0);
    });

    self.imagesUpdated = function() {
        partyWifi.applyMagnificPopup();
    }

    // Checks if there is a next page
    self.canNext = ko.computed(function () {
        return (self.currentPage() + 1) <= self.totalPages();
    }, this);

    self.next = function () {
        changePage(self.currentPage() + 1);
    }

    // Checks if there is a previous page
    self.canPrev = ko.computed(function () {
        return (self.currentPage() - 1) > 0;
    }, this);

    self.prev = function () {
        changePage(self.currentPage() - 1);
    }

    // Remove an image
    self.remove = function (image) {
        $.ajax({
                url: '/api/images/' + image.identifier,
                type: 'DELETE'
            })
            .done(function(data) {
                image.isDeleted(true);
            });
    }


    // Initial load of images
    load(0);
}

ko.applyBindings(new ImageListViewModel());