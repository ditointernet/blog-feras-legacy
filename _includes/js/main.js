var main = (function(window, $) {
  function init() {

    function sharePost(event) {
      var target, options;
      target = $(event.currentTarget).data('target');

      options = "menubar=no, width=600, height=500,"
                + "location=yes, resizable=yes, scrollbars=yes, status=yes";
      window.open(target, null, options);
    };

    return {
      share: $('.js-share-post').on('click', sharePost)
    }
  };

  return init();

})(window, jQuery);