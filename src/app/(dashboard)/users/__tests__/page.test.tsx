import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import UsersPage from "../page";
import { deleteAgent } from "@/app/actions/users";

jest.mock("axios");
jest.mock("@/app/actions/users", () => ({
  deleteAgent: jest.fn(),
}));

const mockedGet = jest.mocked(axios.get);
const mockedDeleteAgent = jest.mocked(deleteAgent);

const AGENTS = [
  {
    id: "1",
    name: "Alice Smith",
    email: "alice@example.com",
    createdAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Bob Jones",
    email: "bob@example.com",
    createdAt: "2024-03-22T00:00:00.000Z",
  },
];

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <UsersPage />
    </QueryClientProvider>
  );
}

describe("UsersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows skeleton rows while loading", () => {
    mockedGet.mockReturnValue(new Promise(() => {})); // never resolves

    renderPage();

    // 4 skeleton rows × 4 cells = 16 skeleton elements
    const skeletons = document.querySelectorAll("[class*='animate-pulse'], .bg-muted");
    // At minimum the table structure is visible
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Email" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Joined" })).toBeInTheDocument();
    // No agent names rendered yet
    expect(screen.queryByText("Alice Smith")).not.toBeInTheDocument();
  });

  it("shows an error message when the fetch fails", async () => {
    mockedGet.mockRejectedValue(new Error("Network Error"));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Failed to load agents.")).toBeInTheDocument();
    });
  });

  it("shows the empty state when there are no agents", async () => {
    mockedGet.mockResolvedValue({ data: [] });

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText("No agents yet. Create one to get started.")
      ).toBeInTheDocument();
    });
  });

  it("renders agents in the table with name, email, and formatted join date", async () => {
    mockedGet.mockResolvedValue({ data: AGENTS });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    });

    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    expect(screen.getByText("bob@example.com")).toBeInTheDocument();

    // Formatted dates — Jan 15, 2024 and Mar 22, 2024
    expect(screen.getByText("Jan 15, 2024")).toBeInTheDocument();
    expect(screen.getByText("Mar 22, 2024")).toBeInTheDocument();
  });

  it("renders a Delete button for each agent", async () => {
    mockedGet.mockResolvedValue({ data: AGENTS });

    renderPage();

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(2);
    });
  });

  it("has a 'New agent' button that opens the dialog", async () => {
    mockedGet.mockResolvedValue({ data: [] });
    const user = userEvent.setup();

    renderPage();

    const trigger = screen.getByRole("button", { name: "New agent" });
    expect(trigger).toBeInTheDocument();

    await user.click(trigger);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  describe("DeleteAgentButton", () => {
    it("shows confirmation UI after clicking Delete", async () => {
      mockedGet.mockResolvedValue({ data: AGENTS });
      const user = userEvent.setup();

      renderPage();

      await waitFor(() => {
        expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(2);
      });

      await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);

      expect(screen.getByText("Delete this agent?")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

    it("dismisses the confirmation when Cancel is clicked", async () => {
      mockedGet.mockResolvedValue({ data: AGENTS });
      const user = userEvent.setup();

      renderPage();

      await waitFor(() => {
        expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(2);
      });

      await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);
      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(screen.queryByText("Delete this agent?")).not.toBeInTheDocument();
      expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(2);
    });

    it("calls deleteAgent with the agent id when Confirm is clicked", async () => {
      mockedGet.mockResolvedValue({ data: AGENTS });
      mockedDeleteAgent.mockResolvedValue(undefined);
      const user = userEvent.setup();

      renderPage();

      await waitFor(() => {
        expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(2);
      });

      await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);
      await user.click(screen.getByRole("button", { name: "Confirm" }));

      await waitFor(() => {
        expect(mockedDeleteAgent).toHaveBeenCalledWith("1");
      });
    });
  });
});
