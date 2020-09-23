/*blacksheep IT consulting Copyright
* Copyright (C) 2020

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

/* Example Context Renderer for Siebel Smartphone UX 20.9 or higher */
/* Based on Bookshelf Example: https://docs.oracle.com/cd/F26413_09/books/ConfigOpenUI/architecture-of-siebel-open-ui.html#c_ExampleOfContextRenderer */
/* Tested on Siebel Call Center 20.9 */
/* Manifest Administration: Associate with form applet, include siebel/phyrenderer.js (Sequence 1)*/

if (typeof SiebelAppFacade.ControlsMenuCR === "undefined") {
    SiebelJS.Namespace("SiebelAppFacade.ControlsMenuCR");
    define("siebel/custom/ControlsMenuCR", ["siebel/basecr"], function () {
        SiebelAppFacade.ControlsMenuCR = (function () {
            function ControlsMenuCR() {
            }
            SiebelJS.Extend(ControlsMenuCR, SiebelAppFacade.BaseCR);

            ControlsMenuCR.prototype.Init = function (prContext) {
                console.log("ControlsMenuCR.Init");
            };

            ControlsMenuCR.prototype.Execute = function (prContext) {
                console.log("ControlsMenuCR.Execute");
                this.CreateControlsMenu(prContext.GetPM());
                
            };

            ControlsMenuCR.prototype.CreateControlsMenu = function(pm){
                var htmlString = "<button class='siebui-icon-display-tile appletButton'>";
                if (pm){
                    var ae = $("#" + pm.Get("GetFullId"));
                    var btnContainer = ae.find(".siebui-btn-grp-applet");
                    if (btnContainer.length){
                        btnContainer.before(htmlString);
                        btnContainer.menu().hide().bind("menuselect", {ctx:this}, function (event, ui){
                            $(this).hide();
                        });

                        ae.find("button.siebui-icon-display-tile").click({ctx: btnContainer}, function (evt){
                            var btnContainerEl = evt.data.ctx;
                            if (btnContainerEl.menu().is(":visible")){
                                btnContainerEl.menu().hide();
                            }
                            else{
                                btnContainerEl.menu().show().position({
                                    my: "center top",
                                    at: "center bottom",
                                    of: $(this),
                                    collision: "flipfit flipfit"
                                });
                            }
                        });
                    }
                }
            };

            return ControlsMenuCR;
        }());
        return SiebelAppFacade.ControlsMenuCR;
    });
}
