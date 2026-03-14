import {
    productCard,
    productListGrid,
} from "../../fields";

const clearGuestCartState = () => {
    cy.clearCookie("DROPIN__CART__CART-ID");
};

describe("Verify empty mini cart icon regression", () => {
    it("keeps product card cart icons visible after opening and closing an empty mini cart", () => {
        clearGuestCartState();

        cy.visit("/apparel", {
            onBeforeLoad(win) {
                win.localStorage.removeItem("DROPIN__CART__CART__AUTHENTICATED");
                win.sessionStorage.removeItem("DROPIN__CART__CART__DATA");
                win.sessionStorage.removeItem("DROPIN__CART__SHIPPING__DATA");
            },
        });

        cy.waitForLoadingSkeletonToDisappear();
        cy.get(productListGrid).should("be.visible");

        cy.contains(`${productCard} button`, "Add to Cart")
            .first()
            .scrollIntoView()
            .as("addToCartButton");

        cy.get("@addToCartButton")
            .should("be.visible")
            .find("svg")
            .should("be.visible");

        cy.get(".minicart-wrapper")
            .should("be.visible")
            .click();

        cy.get(".minicart-panel[data-loaded='true']")
            .should("exist")
            .and("be.visible");
        cy.get(".dropin-illustrated-message").should("be.visible");
        cy.get(".commerce-mini-cart__close-button")
            .should("be.visible")
            .click();

        cy.get("@addToCartButton")
            .should("be.visible")
            .find("svg")
            .should("be.visible");
    });
});