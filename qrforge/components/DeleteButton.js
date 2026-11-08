'use client';

export default function DeleteButton({ action }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm('Delete this QR code? Printed copies will stop working. This cannot be undone.')) {
          e.preventDefault();
        }
      }}
    >
      <button className="btn-danger w-full">Delete</button>
    </form>
  );
}
